var Config = {};

Config.controller_upgraders = 1;
Config.max_builders = 5;
Config.builders = 2;
Config.repairers = 1;
Config.max_scouts = 1;
Config.max_guards = 1;
Config.max_ranged = 1;
Config.max_healers = 0;
Config.twitch_threshold = 10;
Config.minimal_energy_for_renew = 400;
Config.critical_ttl = 200;
Config.renew_ttl = 500;
Config.renew_to_ttl = 1450;
Config.stop_renew_prob = 0.005;
Config.min_energy_per_level = 200;
Config.repair_threshold = 0.9;
Config.structures_repair_threshold = 0.5;
Config.min_repair = 30000;

module.exports = Config;
