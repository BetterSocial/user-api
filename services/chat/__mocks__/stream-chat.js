class MockStreamChat {
  _instance;
  static getInstance = jest.fn(() => {
    this._instance = new MockStreamChat();
    expect(this._instance).toBeInstanceOf(MockStreamChat);
    return this._instance;
  });
  // Mock the connect method
  connectUser = jest.fn();
  disconnectUser = jest.fn();
  // Mock the queryChannels method
  queryChannels = jest.fn(async () => {
    return [{data: {}, config: {}, own_capabilities: {}, state: {members: [{}], messages: ''}}];
  });
}

// Export the mocked StreamChat class
module.exports = {StreamChat: MockStreamChat};
