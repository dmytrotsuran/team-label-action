import * as core from '@actions/core';
import { GitHub } from '@actions/github/lib/utils';

export const getTeamSlugsForAuthor = async (
  octokit: InstanceType<typeof GitHub>,
  org: string,
  username: string,
  ignoreSlugs: string[] = [],
): Promise<string[]> => {
  const authorsTeamSlugs: string[] = [];

  let page = 1;
  let hasMorePages = true;
  const allTeams = [];

  while (hasMorePages) {
    const { data: teams } = await octokit.rest.teams.list({
      org,
      page,
      per_page: 100, // Fetch 100 results per page
    });

    allTeams.push(...teams);

    if (teams.length < 100) {
      hasMorePages = false; // No more pages if the current page has fewer than 100 items
    } else {
      page++;
    }
  }

  for (const { slug } of allTeams) {
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
