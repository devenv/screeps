var Config = {};

Config.roles = ['miner', 'carrier', 'builder', 'scout', 'soldier', 'ranged', 'healer', 'extractor'];

Config.long_update_freq = 50;

Config.controller_upgraders = 1;
Config.max_builders = 4;
Config.builders = 2;
Config.repairers = 1;
Config.max_scouts = 0;
Config.max_guards = 1;
Config.max_ranged = 1;
Config.max_healers = 0;

Config.minimal_energy_for_renew = 400;
Config.critical_ttl = 200;
Config.renew_ttl = 500;
Config.renew_to_ttl = 1450;
Config.stop_renew_prob = 0.005;

Config.min_energy_per_level = 200;

Config.repair_threshold = 0.9;
Config.critical_repair_threshold = 0.25;

Config.terminal_min_energy = 2000;
Config.terminal_max_energy = 4000;

Config.reuse_path_ticks = 20;
Config.path_max_ops = 200;
Config.path_freq_threshold = 2;
Config.min_path_length = 3;
Config.twitch_threshold = 10;

Config.low_cpu = 2000;
Config.critical_cpu = 300;

Config.miner_sleep = 20;
Config.carrier_sleep = 20;
Config.builder_sleep = 20;
Config.scout_sleep = 50;
Config.soldier_sleep = 50;
Config.ranged_sleep = 50;
Config.healer_sleep = 50;

module.exports = Config;
