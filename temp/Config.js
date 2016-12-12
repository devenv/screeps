var Config = {};

Config.roles = ['miner', 'carrier', 'builder', 'scout', 'soldier', 'ranged', 'healer', 'extractor'];

Config.long_update_freq = 20;

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
Config.reuse_path_ticks = 20;
Config.path_max_ops = 500;
Config.terminal_min_energy = 2000;
Config.terminal_max_energy = 4000;
Config.path_freq_threshold = 2;
Config.min_path_length = 3;
Config.low_cpu = 2000;
Config.critical_cpu = 300;

module.exports = Config;
