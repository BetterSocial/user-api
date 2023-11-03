class MockStreamChat {
  constructor() {
    this.connectUser = jest.fn;
    this.disconnectUser = jest.fn;
    this.queryChannels = jest.fn(async () => {
      return [{data: {}, config: {}, own_capabilities: {}, state: {members: [{}], messages: ''}}];
    });
    this._instance = this;
  }

  _instance;
  static getInstance = () => {
    if (!this._instance) {
      this._instance = new MockStreamChat();
    }
    return this._instance;
  };
  // Mock the connect method
  connectUser = jest.fn;
  disconnectUser = jest.fn;
  // Mock the queryChannels method
  queryChannels = jest.fn(async () => {
    return [{data: {}, config: {}, own_capabilities: {}, state: {members: [{}], messages: ''}}];
  });
}

// Export the mocked StreamChat class
module.exports = {StreamChat: MockStreamChat};
