const test = {
  launch: async (userRequested) => {
    let user = userRequested || 'precious_ella_cat';
    let url = `https://www.instagram.com/${user}/`;
    console.log(`Launching ${url}`);
    let responseData = {
      data: {
        user,
        url,
      },
    };
    return JSON.stringify(responseData);
  },
};

module.exports = test;
