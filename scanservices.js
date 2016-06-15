var noble = require('noble');
// https://github.com/google/eddystone/blob/master/protocol-specification.md
// Eddystone Frames
// FEAA - Eddystone ASCII URL
// FEDF - Eddystone UID
//
var serviceUuids = ['FEAA','FEDF']; //feaa fedf

// On Raspberry Pi make sure Power is on or this wont work
// $ sudo bluetoothctl
// # power on
// # scan on
noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
    //    noble.startScanning(serviceUuids, true);
        noble.startScanning();
    } else {
        noble.stopScanning();
    }
});

noble.on('discover', function(peripheral) {
    console.log('peripheral discovered (' + peripheral.id +
        ' with address <' + peripheral.address +  ', ' + peripheral.addressType + '>,' +
        ' connectable ' + peripheral.connectable + ',' +
        ' RSSI ' + peripheral.rssi + ':');
    console.log('\t\tLocal name is:' + peripheral.advertisement.localName);
   // console.log('\t\t' + peripheral.advertisement.localName);
    console.log('\tcan I interest you in any of the following advertised services:');
    console.log('\t\t' + JSON.stringify(peripheral.advertisement.serviceUuids).toUpperCase());

    var serviceData = peripheral.advertisement.serviceData;
    if (serviceData && serviceData.length) {
        console.log('\there is my service data:');
        for (var i in serviceData) {
            console.log('\t\t' + JSON.stringify(serviceData[i].uuid.toUpperCase()) + ': ' + JSON.stringify(serviceData[i].data.toString('hex')));
            var tempSvcData = JSON.stringify(serviceData[i].data.toString('hex'));

            tempSvcData = tempSvcData.replace(/['"]+/g,'');

            if(tempSvcData.substring(0,2) == '10') {
                console.log('\t*******Got URL! *******');

                var eddystoneURL = tempSvcData.split(/(.{2})(.{2})(.{2})(.*)/).filter(String);
                console.log(eddystoneURL[3]);
                console.log(hex2a(eddystoneURL[3]));

              }

            if(tempSvcData.substring(0,2) == '00') {
                console.log('\t*******Got NameSpace! *******');

                var eddystoneUID = tempSvcData.split(/(.{2})(.{2})(.{20})(.{12})(.{4})(.*)/).filter(String);
                console.log('Distance: ' + parseInt('0x' + eddystoneUID[1]),16);
                console.log('Namespace ID: ' + Number(eddystoneUID[2])); //.replace(/\b0*([1-9][0-9]*|0)\b/),'');
                console.log('Instance ID: ' + Number(eddystoneUID[3])); // .replace(/\b0*([1-9][0-9]*|0)\b/),'');
            }
            console.log();
        }
    }
    if (peripheral.advertisement.manufacturerData) {
        console.log('\there is my manufacturer data:');
        console.log('\t\t' + JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex')));
        var FEFD= peripheral.advertisement.manufacturerData.toString('hex');
     // Var length is going to mess this up
        //   var FEFDStruct = FEFD.split(/(.{2})(.{2})(.{10})(.{6})(.{4})/).filter(string);
     //   console.log(FEFD);
        console.log();
    }
    if (peripheral.advertisement.txPowerLevel !== undefined) {
        console.log('\tmy TX power level is:');
        console.log('\t\t' + peripheral.advertisement.txPowerLevel);
    }

    console.log();
});

function hex2a(hexx) {
    var hex = hexx.toString();
    var str = '';
    for(var i=0; i < hex.length; i +=2) {
        var v = parseInt(hex.substring(i, i+2), 16)
        if(v) str += String.fromCharCode(v);
    }
    return str;
}
