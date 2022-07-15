'use strict';

var lambdaHandler = function(event, context, callback) {
    const connData = {
        port: event.context['my-port'],
        host: event.context['my-host'],
        timeout: event.context['my-timeout']
    };

    // Set the default timeout to 50ms
    const timeout = typeof connData.timeout !== 'undefined' ?
                    parseInt(connData.timeout) :
                    50; // Fallback to 50ms
    const net = require('net');
    var message = 'Whoops port ' + connData.port + ' on host `' +
                  connData.host + '` seems closed!';

    const client = net.connect(connData, function() {
      message = 'Port ' + connData.port + ' on ' + connData.host + ' is open!';

      // Return some values to the caller
      callback(null, message);

      // We don't need it anymore
      client.destroy();
    });

    client.setTimeout(timeout, function() {
        // Close it manually
        client.destroy(new Error(message), null);
    });

    client.on('error', function(err) {
        // Return error to the caller
        callback(new Error(message), null);
    });
};


exports.checkPortOpen = lambdaHandler;


if (require.main === module) {
    var lambdaContext = {
        context: {
            'my-host': process.env.MY_HOST,
            'my-port': process.env.MY_PORT,
            'my-timeout': process.env.MY_TIMEOUT
        }
    };

    lambdaHandler(lambdaContext, null, function(err, data) {
        if (err) {
            console.log(err.message);
            return null;
        }

        console.log(data);
    });
}
