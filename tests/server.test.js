global.renderData = vi.fn();

var server = require('../server/server.js');

describe('server.js - Coverage Tests', function() {
  test('onTicketCreateHandler should exist and be a function', function() {
    expect(server.onTicketCreateHandler).toBeDefined();
    expect(typeof server.onTicketCreateHandler).toBe('function');
  });

  test('onAppInstallHandler should exist and be a function', function() {
    expect(server.onAppInstallHandler).toBeDefined();
    expect(typeof server.onAppInstallHandler).toBe('function');
  });

  test('onAppUninstallHandler should exist and be a function', function() {
    expect(server.onAppUninstallHandler).toBeDefined();
    expect(typeof server.onAppUninstallHandler).toBe('function');
  });

  test('server exports should be an object', function() {
    expect(typeof server).toBe('object');
    expect(server).not.toBeNull();
  });
});
