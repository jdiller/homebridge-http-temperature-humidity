var Service, Characteristic;
var request = require('sync-request');

var temperatureService;
var humidityService;
var url;
var humidity = 0;
var temperature = 0;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-httptemperaturehumidity", "HttpTemphum", HttpTemphum);
}

function HttpTemphum(log, config) {
    this.log = log;

    // url info
    this.url = config["url"];
    this.http_method = config["http_method"];
    this.sendimmediately = config["sendimmediately"];
    this.name = config["name"];
}

HttpTemphum.prototype = {

    makeRequest: function(callback){
        this.log('starting HTTP ' + this.http_method + ' request to ' + this.url);
        var req = {
            'method': 'get', //this.http_method,
            'url': this.url
        };
        request(req, function(error, res, body){
            if(error){
                this.log('HTTP request failed');
                callback(error);
            } else {
                this.log('HTTP request succeeded!');
                var info = JSON.parse(body);

                temperatureService.setCharacteristic(Characteristic.CurrentTemperature, info.temperature);
                humidityService.setCharacteristic(Characteristic.CurrentRelativeHumidity, info.humidity);

                this.log(body);
                this.log(info);
                this.temperature = Number(info.temperature);
                this.humidity = Number(info.humidity);
                callback();
            }

        });
    },

    getStateHumidity: function(callback) {
        this.makeRequest(callback);
    },

    getStateTemperature: function(callback) {
        this.makeRequest(callback);
    },

    identify: function (callback) {
        this.log("Identify requested!");
        callback(); // success
    },

    getServices: function () {
        var informationService = new Service.AccessoryInformation();

        informationService
                .setCharacteristic(Characteristic.Manufacturer, "Luca Manufacturer")
                .setCharacteristic(Characteristic.Model, "Luca Model")
                .setCharacteristic(Characteristic.SerialNumber, "Luca Serial Number");

        temperatureService = new Service.TemperatureSensor(this.name);
        temperatureService
                .getCharacteristic(Characteristic.CurrentTemperature)
                .setProps({
                    minValue: -100,
                    value: 10
                })
                .on('get', this.getStateTemperature.bind(this));

        humidityService = new Service.HumiditySensor(this.name);
        humidityService
                .getCharacteristic(Characteristic.CurrentRelativeHumidity)
                .on('get', this.getStateHumidity.bind(this));

        return [temperatureService, humidityService];
    }
};
