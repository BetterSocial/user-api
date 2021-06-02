const getstream = jest.createMockFromModule('getstream');

function __connect (apiKey, apiSecret) {
  return {
      user: function(userId){
        return {
          create: function(data){
            if ( data.name === "Kevin") {
              return Promise.resolve(); // then
            } else {
              return Promise.reject(); // catch
            }
          }
        }
      }      
  };
};

getstream.connect = __connect;

module.exports = getstream;