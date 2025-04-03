import * as core from '@actions/core';
import { GitHub } from '@actions/github/lib/utils';

export const getTeamSlugsForAuthor = async (
  octokit: InstanceType<typeof GitHub>,
  org: string,
  username: string,
  ignoreSlugs: string[] = [],
): Promise<string[]> => {
  const authorsTeamSlugs: string[] = [];

  let team_slug = 'b2b-connect-ordering-ngo';

  const { data: teams } = await octokit.rest.teams.listChildInOrg({
    org,
    team_slug,
  });

  for (const { slug } of teams) {
    if (ignoreSlugs.includes(slug)) {
      continue;
    }

    try {
      const { data: membership } = await octokit.rest.teams.getMembershipForUserInOrg({
        org,
        team_slug: slug,
        username,
      });

      if (membership.state === 'active') {
        authorsTeamSlugs.push(slug);
      }
    } catch (error) {
      core.info(`${username} not a member of team: ${slug}`);
    }
  }

  return authorsTeamSlugs;
};
