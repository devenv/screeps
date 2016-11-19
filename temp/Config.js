var Config = {};

Config.controller_upgraders = 2;
Config.max_builders = 5;
Config.builders = 2;
Config.max_miners = 12;
Config.max_scouts = 1;
Config.max_guards = 1;
Config.max_ranged = 1;
Config.max_healers = 0;
Config.twitch_threshold = 10;
Config.renew_ttl = 500;
Config.renew_to_ttl = 2000;
Config.stop_renew_prob = 0.1;
Config.min_extension_energy = 40;
Config.min_spawn_energy = 200;
Config.repair_threshold = 0.9;
Config.structures_repair_threshold = 0.5;
Config.min_repair = 30000;

module.exports = Config;
