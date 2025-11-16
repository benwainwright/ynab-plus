export const getTokenRefreshTaskKey = (username: string, provider: string) => {
  return `${username}-${provider}-token-refresh-task`;
};
