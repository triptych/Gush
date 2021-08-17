import { k } from "/kaboom.js";
import { announce } from "/utils.js";
import state from "/state.js";
import { spawnObject } from "/levels/spatial.js";
import * as monster from "/objects/monster.js";
import { monsterWave, coinReward, crateWall } from "/levels/maps/utils.js";
import music from "/music.js";

const map = [
  "┌{─{─{┐     ┌──)────)──┐     ┌───────┐            ┌──────────────────┐",
  "│·····└─────┘··········└─────┘·······│            │··············w···│",
  "│··········1···············w·2·······│            │··················│",
  "│··@·······1···········w·····2·······└───}}────!──┘··┌────────────┐··│",
  "│··········1···············w·2···········b········zzz│            │··│",
  "│·····┌─────┐··········┌─────┐············b·······zzz│ ┌────────┐ │··│",
  "└{─{─{┘     └──)────)──┘     └───────────}}───────┐··│ │g·······│ │··│",
  "                                                  │··│ │········│ │··│",
  " ┌───┐                                ┌───────────┘33│ │··┌──┐··│ │··│",
  "┌┘$·$└┐====┌─────────────────────┐    │······e·······│ │··│  │^^│ │^^│",
  "│··?··/    /··i··················│    │····e·········│ │··│  │··│ │··│",
  "└┐$·$┌┘====└──────────────────┐··│    │··┌───────────┘ │··│  │··└─┘··│",
  " └───┘                        │··│    │00│            ┌┘··└┐ │·······│",
  "                          ┌───┘··└────┘··└──────────┐ │$··$│ │··g····│",
  "┌─────────────────────────┘·························│ │·$$·│ └───────┘",
  "│·z···············································$·│ │$··$│          ",
  "│·················································$·│ └────┘          ",
  "│··┌──────────────────────┐········o····o····o······│                 ",
  "│··│                      └───┐··┌────┐··┌──────────┘                 ",
  "│·z│            ┌(─(──(─(┐    │··│    │··│            ┌──────────────┐",
  "│··│           ┌┘········└┐   │··│    │··│     ┌──────┘··············│",
  "│··│========== │·^······^·│   │··│    │··│     │·····················│",
  "│^·│         = │··········│   │··│    │··│     │··┌───────────────┐··│",
  "│··│ ┌──────_┐ │···^··^·88└───┘··└┐  ┌┘··└┐    │··│               │··│",
  "│··│ │$·$·$·$│ │····##·88·········│==│····└────┘··└─────────────┐ │··│",
  "│··│ │·$·$·$·│ │·^·####8^·········/  /············4·············│ │··│",
  "│··│ │$·$·$·$│ │····##·88·········│==│····┌────┐444·············│ │··│",
  "│··│ │·$·$·$·│ │···^··^·88┌───┐··┌┘  └┐··┌┘    │················│ │··│",
  "│··│ │$·$·$·$│ │··········│   │··│====│··│     │················│ │··│",
  "│··│ │·$·$·$·│ │·^······^·│   │··│=$$=│··│     │················│ │··│",
  "│z^│ └───────┘ └┐········┌┘   │··│=$$=│··│     │················│ │··│",
  "│··│ ===========└(─(──(─(┘    │··│=  =│··│     │················│ │··│",
  "│··│                  =       │··│=  =│··│     │················│ │··│",
  "│zz│================= =       │··│=  =│··│     │················│ │··│",
  "│··│                = =       │··│=  =│··│     └────────────────┘ │··│",
  "│··│                = =       │··│=  =│··│                        │··│",
  "│··│ ┌─────────────┐= =┌──────┘··└─__─┘··└─────────────┐  ┌───────┘··│",
  "│··│ │·······i·i··$│= =│·······················w·······│  │······z···│",
  "│··│ │········d···$│= =│w······························│  │···z······│",
  "│··│ │··┌──────────┘= =└────────────────────────────┐··│  │··········│",
  "│··│ │··│           =                       =       │··└──┘····┌─────┘",
  "│^·│ │··│           ======================= =       │··········│      ",
  "│z·│ │··└──────────────────────────┐      ┌_┐       │··········│ ┌───┐",
  "│··│ │·····························│     ┌┘$└┐      │··┌──┐····│ │·o·│",
  "│··│ │·····························│    ┌┘···└┐     │··│  │····└─┘···│",
  "│··│ └─┐·┌──┐······················│   ┌┘·····└┐    │··│  │··········│",
  "│··│   │·│  │······················│  ┌┘··$·$··└┐   │··│  │··········│",
  "│··│   │·│  │······················│  │$···?···$│   │··│  │····┌─┐···│",
  "│··│   │·│  │······················│  └┐··$·$··┌┘   │··│  │····│ │·o·│",
  "│··│   │·│  │······················│   └┐·····┌┘    │··│  │····│ └───┘",
  "│··│   │·│  │······················│    └┐···┌┘     │··│  │····│      ",
  "│··│   │·│  │······················│     └┐$┌┘      │··│  │····└─────┐",
  "│··│   │·│  │······················│      └_┘       │··│  │··········│",
  "│·z│   │·│  │····················55│      = =       │··│  │··········│",
  "│··│  ┌┘·└┐ │····················5·└───────_────────┘··│  │·z··┌──┐··│",
  "│··│  │···│ │····················5·····················│  │····│  │··│",
  "│··│  │·?·│ │····················5·····················│  │····│  │··│",
  "│··│  │···│ └──────────────────────────────────────────┘  │····│  │··│",
  "│·^│  └───┘                                               │····│  │··│",
  "│··│               ┌──────────────────────────────────────┘····│  │··│",
  "│··└───────────────┘···························o···············│  │i·│",
  "│·z······························Z··········o··················│  │··│",
  "│···········································o··················│  │··│",
  "└_──────────────────┐··························o············o··│  │··│",
  "= =                 └─────────────────────────────────┐··┌─────┘  │·w│",
  "┌_──┐                                                 │··│        │··│",
  "│···└─────────────────────────────────────────────────┘··└────────┘··│",
  "│·>························6·········································│",
  "│··························6·········································│",
  "└────────────────────────────────────────────────────────────────────┘",
];


let showTutorial = true;
const tutorialKey = "level-1-1-tutorials";

const bgMusic = "stark-nuances";
const bgVolume = 0.77;

map.onStart = () => {
  showTutorial = state.get(tutorialKey) ?? true;
  if (showTutorial) announce("WASD to move");
  music.play(bgMusic, { volume: bgVolume });
}

const triggered = {};

map.triggers = {
  1: () => {
    state.set(tutorialKey, false);
  },
  1: () => {
    if (showTutorial) announce("SPACE to attack");
  },
  2: () => {
    if (showTutorial) {
      announce("GREEN potions charge BURP meter");
      announce("Press B to BURP");
    }
  },
  3: () => {
    if (showTutorial) announce("BLUE potions charge SHIELDS");
  },
  4: () => {
    monsterWave(() => ([
      spawnObject(monster.imp(), 46, 25),
      spawnObject(monster.imp(), 49, 24),
      spawnObject(monster.imp(), 49, 32),
      spawnObject(monster.imp(), 55, 28),
    ]));
  },
  6: () => {
    monsterWave(() => ([
      spawnObject(monster.imp(), 22, 67),
      spawnObject(monster.imp(), 22, 68),
      spawnObject(monster.imp(), 23, 67),
      spawnObject(monster.imp(), 23, 68),
      spawnObject(monster.imp(), 29, 67),
      spawnObject(monster.imp(), 29, 68),
      spawnObject(monster.imp(), 30, 67),
      spawnObject(monster.imp(), 30, 68),
    ]));
  },
  8: async () => {
    music.crossFade("battle-3", { volume: 0.8 });

    // block off exit with crates
    const crates = crateWall([26, 24], [26, 25], [26, 26]);

    // wave 1
    await monsterWave(() => ([
      spawnObject(monster.wogol(), 18, 22),
      spawnObject(monster.wogol(), 18, 28),
    ]));

    // wave 2
    await monsterWave(() => ([
      spawnObject(monster.imp(), 18, 22),
      spawnObject(monster.imp(), 18, 28),
      spawnObject(monster.imp(), 24, 22),
      spawnObject(monster.imp(), 24, 28),
    ]));

    // wave 3
    await monsterWave(() => ([
      spawnObject(monster.demonSmall(), 16, 21),
      spawnObject(monster.demonSmall(), 16, 29),
    ]));

    // reward
    coinReward(
      [16, 21], [16, 25], [16, 29], [18, 22], [18, 25], [18, 28],
      [20, 23], [21, 23], [20, 27], [21, 27],
      [25, 21], [25, 25], [25, 29], [23, 22], [23, 25], [23, 28],
    );

    // remove wall of crates
    crates.forEach(c => c.destroy());

    music.crossFade(bgMusic, {
      volume: 0.77,
    });
  }
};

export default map;