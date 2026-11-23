// Generated from 00GameDevs catalogue 16d841b646079ca5af05d99ffcf1f556d9704eee4b6fb8f6aa63bed9cbfee66f.
export const effects=[
  {
    "id": "fireball",
    "name": {
      "zh": "熾焰火球",
      "en": "Blazing Fireball"
    },
    "category": "projectile",
    "description": {
      "zh": "火球拖著火尾向前飛，命中爆出弧光與火星，接觸處留下漸暗的裂紋。",
      "en": "A trailing fireball bursts into bright arcs and sparks, leaving fading cracks on contact."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "medium",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "setDirection"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ff823e",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "fe3081b4d82770c54f2e0cfc947f38db5d62e0ef0ae033a8f24cb6729a84a0ff"
  },
  {
    "id": "plasma-bolt",
    "name": {
      "zh": "電漿尖矢",
      "en": "Plasma Dart"
    },
    "category": "projectile",
    "description": {
      "zh": "亮白箭頭帶著藍色閃電往前飛，身後留下細小火花。",
      "en": "A bright arrow flies with blue lightning and tiny sparks behind it."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "setDirection"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#73e3ff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "c7363bbf461d0441ac6632cc77fb0fac73d52823fa83f0ead0d12ce93e8fc7a2"
  },
  {
    "id": "ice-shard",
    "name": {
      "zh": "霜晶飛矢",
      "en": "Frostcrystal Dart"
    },
    "category": "projectile",
    "description": {
      "zh": "一簇尖冰向前飛，身後掉落旋轉的小冰塊與細霜。",
      "en": "A cluster of sharp ice flies forward, shedding little ice pieces and frost."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "setDirection"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#b3dcff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "1e4435794dfacfaea3852ca748dc14f6440d17ad1112ebba46c84913ceb02861"
  },
  {
    "id": "arcane-missile",
    "name": {
      "zh": "符晶飛彈",
      "en": "Runic Crystal Missiles"
    },
    "category": "projectile",
    "description": {
      "zh": "三顆魔法水晶一邊繞圈一邊前進，身後拖著發光圖案。",
      "en": "Three magic crystals circle as they fly, trailing glowing shapes."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "setDirection"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#c99aff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 6,
        "default": 3
      },
      "spread": {
        "min": 0.5,
        "max": 3,
        "default": 1
      }
    },
    "sha256": "ced2ec19df19aebe4ea93cd42279afeea55dce8cfa9017f8e147dc552617e0bf"
  },
  {
    "id": "continuous-beam",
    "name": {
      "zh": "繞絲光束",
      "en": "Threadwoven Beam"
    },
    "category": "beam",
    "description": {
      "zh": "細光線持續往前射，光絲繞著它轉，打中時冒出火花。",
      "en": "A steady beam has light swirling around it and sparks where it hits."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "setEndpoints"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ff6555",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "339a746961c4eb6f6c26ef16ef144021caa6c18c54ba2b6485f520abb424051d"
  },
  {
    "id": "pulse-beam",
    "name": {
      "zh": "環脈射線",
      "en": "Ringpulse Ray"
    },
    "category": "beam",
    "description": {
      "zh": "光線上亮起一顆顆光球，光圈沿著光線往前跑。",
      "en": "Glowing balls light up along a beam as rings travel forward."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "setEndpoints"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#71e7dc",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 8,
        "default": 4
      }
    },
    "sha256": "6b980dd02530c4f38c80ec23eb6b38633b6bc78078c06f0c5fea956287c39fad"
  },
  {
    "id": "charged-beam",
    "name": {
      "zh": "蓄能光炮",
      "en": "Charged Light Cannon"
    },
    "category": "beam",
    "description": {
      "zh": "先聚起亮光再持續發射，打中的地方不斷噴出亮光與光圈。",
      "en": "Light gathers before a steady blast fires, with flashes and rings where it hits."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "setEndpoints"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#f6c76c",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "4b32b2d2e344e1f0b032f380c2b597f92491c4b359e3e5056a7b7649a903b026"
  },
  {
    "id": "arc-ray",
    "name": {
      "zh": "分岔雷流",
      "en": "Forked Lightning Stream"
    },
    "category": "beam",
    "description": {
      "zh": "藍白閃電連接兩端，小閃電在旁跳動，打中時炸出火花。",
      "en": "Blue-white lightning connects two ends, with little branches and sparks at the hit."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "setEndpoints"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#2878ff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 12,
        "default": 6
      }
    },
    "sha256": "3d8ed333daa8af8bfc3932c5e462c847f298fdbc781b745d9cc4f30338943afd"
  },
  {
    "id": "healing-field",
    "name": {
      "zh": "療光法陣",
      "en": "Healing Sigil"
    },
    "category": "area",
    "description": {
      "zh": "地上的魔法圖案一圈圈發光，小十字向上飄，適合補血時使用。",
      "en": "A magic pattern sends out rings of light and floating crosses for healing."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#86e9b2",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "9e63dbcee743b22dcc7d5e5a200a1d55b6ea60c55e6c971cce3e6660c6db3696"
  },
  {
    "id": "burning-ground",
    "name": {
      "zh": "炎紋灼地",
      "en": "Flame-Etched Ground"
    },
    "category": "area",
    "description": {
      "zh": "地面裂縫發出紅光，火舌不斷冒出又散去，像正在燃燒。",
      "en": "Red cracks glow on the ground as flames keep rising and fading."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ff914a",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "be7066be763daef65dcade042f65e23bee4a0c397075228f5a20a153cac6b64a"
  },
  {
    "id": "frost-field",
    "name": {
      "zh": "六芒霜陣",
      "en": "Sixfold Frost Sigil"
    },
    "category": "area",
    "description": {
      "zh": "雪花形的魔法圖案向外亮起，上方有小冰屑慢慢閃光。",
      "en": "A snowflake-shaped magic pattern lights outward, with ice sparkling above it."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#9bdfff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "10ed9730655fc7c4556d5e57604962788098927fee8632d9fff667a9e03ae830"
  },
  {
    "id": "magic-barrier",
    "name": {
      "zh": "符網結界",
      "en": "Runic Mesh Barrier"
    },
    "category": "area",
    "description": {
      "zh": "半圓形光罩從地面升起，表面有發光格子與閃動的小方塊。",
      "en": "A half-round shield rises from the ground with glowing squares on its surface."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#bba3ff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "63d4eee8e1e1159c26d151c041e2d4657cebb6beae84a598edc3fb8f6c53d680"
  },
  {
    "id": "fire-explosion",
    "name": {
      "zh": "白熱炎爆",
      "en": "White-Hot Fireburst"
    },
    "category": "burst",
    "description": {
      "zh": "火球炸開並吹出一圈煙，火焰慢慢變成煙霧，留下小火星。",
      "en": "A fireball bursts with a ring of smoke, then cools into smoke and little embers."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ff5c26",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "0c6580ed465b311f617927cfbccde3a2378729f3a50d80c65a90aafb6531e260"
  },
  {
    "id": "energy-burst",
    "name": {
      "zh": "雷弧綻爆",
      "en": "Lightning Arc Burst"
    },
    "category": "burst",
    "description": {
      "zh": "藍白亮光突然炸開，閃電向四周伸展，最後剩下零星電光。",
      "en": "Blue-white light bursts into branching lightning, then fades to scattered flashes."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#2878ff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 24,
        "default": 12
      }
    },
    "sha256": "39f6cbe53f3391739c4a53a89bda1b09a68817ac5ae05cbb30589e1b40a28fe6"
  },
  {
    "id": "shockwave",
    "name": {
      "zh": "揚塵震波",
      "en": "Dust-Raising Shockwave"
    },
    "category": "burst",
    "description": {
      "zh": "一圈塵土向外衝，捲起大片灰塵，小石頭再落回地面。",
      "en": "A ring of dust rushes outward, lifting clouds before small stones fall back down."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#f0cf9d",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "780897f80b72180495a750e4ad24393f8dd3550fd8e44f1f91bd4e20be4306b0"
  },
  {
    "id": "ice-shatter",
    "name": {
      "zh": "裂晶霜爆",
      "en": "Shattering Frostburst"
    },
    "category": "burst",
    "description": {
      "zh": "冰柱先亮起裂紋，再炸成一塊塊飛散的小冰晶。",
      "en": "Cracks light up on ice pillars before they burst into flying ice pieces."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#b8e5ff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 18,
        "default": 9
      }
    },
    "sha256": "8ac404ad815b906c0d85fc7c2db02c0fcbf6d5d302b2cee8c7d1b0c18219509e"
  },
  {
    "id": "wind-vortex",
    "name": {
      "zh": "捲葉風旋",
      "en": "Leaf-Swept Vortex"
    },
    "category": "vortex",
    "description": {
      "zh": "旋風不停往上捲，葉子穿過中央，地面的灰塵也被捲進去。",
      "en": "Wind spirals upward, carrying leaves through its center and drawing in dust."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "medium",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#a4dfd1",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "341c7066de4f6a4e55f3adf07ddbf78d25c95641656f259f6f02533fbc43f16c"
  },
  {
    "id": "dust-devil",
    "name": {
      "zh": "飛砂風旋",
      "en": "Sand-Swept Vortex"
    },
    "category": "vortex",
    "description": {
      "zh": "一圈圈沙塵交錯往上捲，中央留著空隙，旁邊有砂石飛動。",
      "en": "Bands of sand spiral upward around an open center, with grit flying nearby."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#dcbb87",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "6e3c2faef3605046947aa944658180c79f7c59a6a9e554d58e35fc8d46b4b32d"
  },
  {
    "id": "fire-vortex",
    "name": {
      "zh": "捲焰風旋",
      "en": "Flame-Swept Vortex"
    },
    "category": "vortex",
    "description": {
      "zh": "橙色火焰繞圈往上捲，底下的煙塵也被火光照亮。",
      "en": "Orange flames spiral upward, lighting the dust and smoke below."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "medium",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ff884b",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "80f5e34fa52b4ed907008aa5cb15601d2261577ca32fafc38503a42ff1743433"
  },
  {
    "id": "energy-vortex",
    "name": {
      "zh": "符環渦流",
      "en": "Runic Ring Vortex"
    },
    "category": "vortex",
    "description": {
      "zh": "發光帶繞圈往上捲，魔法圖案沿著中央的空隙流動。",
      "en": "Glowing bands spiral upward as magic symbols move around the open center."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#bba5ff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "6376f5f2484badae8bd58143d82d109e844d945c99ef28fab8f1e1dfccf06a40"
  },
  {
    "id": "smoke-column",
    "name": {
      "zh": "湧升煙柱",
      "en": "Billowing Smoke Column"
    },
    "category": "smoke",
    "description": {
      "zh": "一團團煙往上冒，越高越散，也慢慢變淡。",
      "en": "Puffs of smoke rise, spread out and fade as they climb."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#aeb9cb",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "96046754aa39e104655f947d42c66d8de43c8f3ace2b6d2bf8a9f812f887f164"
  },
  {
    "id": "ground-fog",
    "name": {
      "zh": "貼地薄霧",
      "en": "Ground-Hugging Mist"
    },
    "category": "smoke",
    "description": {
      "zh": "薄霧貼著地面鋪開，讓場景有神祕感，也能遮住低處。",
      "en": "Low fog spreads across the ground, adding mystery and hiding low areas."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#a6c9ca",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "43a04bd567b33056edaf721532d5495264ed8ea72e5580a654b991dea5d7cffd"
  },
  {
    "id": "steam-jet",
    "name": {
      "zh": "沖天汽柱",
      "en": "Rising Steam Jet"
    },
    "category": "smoke",
    "description": {
      "zh": "一股細長蒸汽快速往上衝，到頂端後散成薄霧。",
      "en": "A narrow jet of steam shoots upward and spreads into mist at the top."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#d1dfe8",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "a69cf95b6b92cf23849b48dfa90a03529cbabd3384a927d0abb499394700d2c2"
  },
  {
    "id": "smoke-puff",
    "name": {
      "zh": "驟散煙團",
      "en": "Dispersing Smoke Puff"
    },
    "category": "smoke",
    "description": {
      "zh": "一團煙快速膨脹再散去，適合出現、消失或落地時使用。",
      "en": "A puff swells and fades, useful when something appears, vanishes or lands."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#b1afc8",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "14dfbc44e8d38e698c15444d07da44b506fc7675251cb303fafe260220505fac"
  },
  {
    "id": "flame-surge",
    "name": {
      "zh": "翻湧炎潮",
      "en": "Surging Flame Tide"
    },
    "category": "burst",
    "description": {
      "zh": "大片火焰像扇子一樣往上翻，邊緣散成小火星。",
      "en": "A wide fan of flames rolls upward, breaking into little embers at the edges."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ff823e",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 10,
        "default": 5
      }
    },
    "sha256": "fed611406ce1abfad3df2f91527a6b3c1dedb38209f7288a3548568a9f041cce"
  },
  {
    "id": "frost-wheel",
    "name": {
      "zh": "晶齒冰輪",
      "en": "Crystal-Toothed Ice Wheel"
    },
    "category": "projectile",
    "description": {
      "zh": "帶著尖冰齒的冰輪快速旋轉，後面掉落細霜。",
      "en": "An ice wheel with sharp teeth spins quickly and leaves frost behind."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "setDirection"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#a9dfff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "6dd05bd047294847059051cc982fdde235233c84a637f95cde177d9fd471481f"
  },
  {
    "id": "arcane-matrix",
    "name": {
      "zh": "浮符矩陣",
      "en": "Floating Rune Matrix"
    },
    "category": "area",
    "description": {
      "zh": "方格魔法圖案一格格連起來，空中的符號上下移動、重新排隊。",
      "en": "A square magic pattern connects piece by piece while floating symbols rearrange."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#bd9aff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 18,
        "default": 9
      }
    },
    "sha256": "b91f69829494cc2c8d5b736ef928ece6cd93d9634ed0b5f5cb5869b23d5b5b1a"
  },
  {
    "id": "thunder-strike",
    "name": {
      "zh": "渦雷落擊",
      "en": "Vortex Lightning Strike"
    },
    "category": "burst",
    "description": {
      "zh": "上方先聚起電光，再劈下藍白閃電，打中地面時炸出火花。",
      "en": "Light gathers above, then blue-white lightning strikes the ground with sparks."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#2878ff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "8abd775f05004aa3302bd48e4a02c26bcad38a82a88ce9aec6009b9f7e4cdaa6"
  },
  {
    "id": "radiant-beam",
    "name": {
      "zh": "日輪輝柱",
      "en": "Solar Halo Beam"
    },
    "category": "beam",
    "description": {
      "zh": "圓形印記不斷射出明亮光柱，打中的地方像花瓣一樣綻開。",
      "en": "A round symbol fires a steady pillar of light with petal-like flashes where it hits."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "setEndpoints"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ffe3a0",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "6a1f8ee7ef5ae96d055d4c4faa16997392470ab9be8a911b871b86165151ed12"
  },
  {
    "id": "binding-curse",
    "name": {
      "zh": "鉤咒縛陣",
      "en": "Hooked Binding Sigil"
    },
    "category": "area",
    "description": {
      "zh": "鉤子形的魔法圖案亮起，彎曲光帶輪流收緊，像要把人綁住。",
      "en": "Hook-shaped magic marks glow while curved bands tighten like a binding spell."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ae7be5",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 6,
        "default": 3
      }
    },
    "sha256": "e6ab23b4074c1c05b4e80d1b974fc6861cfc403780cdb3c6c2a421c02a3b830b"
  },
  {
    "id": "thorn-crown",
    "name": {
      "zh": "棘蔓綻冠",
      "en": "Thornvine Blossom Crown"
    },
    "category": "area",
    "description": {
      "zh": "地上的魔法圖案長出帶刺藤蔓，葉子張開，花朵跟著亮起。",
      "en": "Thorny vines grow from a magic pattern, opening leaves and glowing flowers."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#88d49a",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 8,
        "default": 4
      }
    },
    "sha256": "c235036f5c4768379876496fa1003548e2dcb46485c5270cd1bb9157f4711504"
  },
  {
    "id": "shadow-glaive",
    "name": {
      "zh": "殘影弧刃",
      "en": "Afterimage Glaive"
    },
    "category": "projectile",
    "description": {
      "zh": "彎曲光刃旋轉著向前衝，身後留下幾道影子，再碎開消失。",
      "en": "A curved blade twists forward, leaving shadows that break apart and vanish."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "setDirection"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#a28bce",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "971b2a69089cee0f1b85068e36a182ea1a03b60f433e130d87e6212469b534a2"
  },
  {
    "id": "tidal-surge",
    "name": {
      "zh": "翻浪衝潮",
      "en": "Breaking Tidal Surge"
    },
    "category": "burst",
    "description": {
      "zh": "一道水浪向外推進，浪頭往前翻，邊緣散成泡沫和水滴。",
      "en": "A wave rolls outward, breaking into foam and droplets along its edge."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#66cddd",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "f9360ecd668ca298c336992914fab32334175fa6dc915a78d16f5e2e5f8451fa"
  },
  {
    "id": "quicksand-seal",
    "name": {
      "zh": "聚砂咒印",
      "en": "Sand-Gathering Sigil"
    },
    "category": "area",
    "description": {
      "zh": "三角魔法圖案裡的沙堆輪流升起、崩落，周圍細沙往內流。",
      "en": "Sand piles rise and collapse inside a magic triangle as nearby sand flows inward."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#dfba7c",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 6,
        "default": 3
      }
    },
    "sha256": "35c353482c441ff7c0a6a0a21502286f8d04a8589b807f3bd2be7e9361669a9c"
  },
  {
    "id": "astral-convergence",
    "name": {
      "zh": "星環聚爆",
      "en": "Astral Ring Detonation"
    },
    "category": "burst",
    "description": {
      "zh": "星光繞圈聚到中央，縮成一團後炸開，留下閃亮的光痕。",
      "en": "Starlight circles inward, squeezes together and bursts into bright trails."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#c1b8ff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 20,
        "default": 10
      }
    },
    "sha256": "f563c880e3847076f2e12b65910e784f94432ec3a2ec92a355975ebe16c59004"
  },
  {
    "id": "spiral-gale",
    "name": {
      "zh": "旋流風矛",
      "en": "Spiraling Wind Spear"
    },
    "category": "projectile",
    "description": {
      "zh": "旋轉的風像長矛往前衝，身後的風痕慢慢變細、消失。",
      "en": "Spinning wind rushes forward like a spear, leaving a trail that narrows and fades."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "setDirection"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#b4e5d5",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "b67e282a05975181aad27a9585da34df5341ed3017670b18292bcbe567093e93"
  },
  {
    "id": "venom-pool",
    "name": {
      "zh": "沸泡毒陣",
      "en": "Bubbling Venom Sigil"
    },
    "category": "area",
    "description": {
      "zh": "地上的綠色魔法圖案冒出毒泡，泡泡破掉後散出小波紋與毒霧。",
      "en": "A green magic pattern bubbles with poison, making ripples and low mist as bubbles pop."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "medium",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#acdc6f",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 14,
        "default": 7
      }
    },
    "sha256": "49db3aff545a972084b18af859e589a1f816e01b4e7885bf4f3777903e8cf4a4"
  },
  {
    "id": "magma-fissure",
    "name": {
      "zh": "熔脈地裂",
      "en": "Molten Vein Fissure"
    },
    "category": "burst",
    "description": {
      "zh": "地面一路裂開發亮，石片被頂起再落下，最後只剩零星火光。",
      "en": "Glowing cracks spread along the ground, lifting stones before fading to small embers."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ff823e",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 26,
        "default": 13
      }
    },
    "sha256": "69411cf579a77fc3864e644b2e09d159a905b8d8dd4f56a52e94b13ede4227a0"
  },
  {
    "id": "prism-guard",
    "name": {
      "zh": "稜晶護壁",
      "en": "Prismatic Crystal Bulwark"
    },
    "category": "shield",
    "description": {
      "zh": "幾片水晶盾拼成彎曲護牆，停止使用後再一片片收回。",
      "en": "Crystal shield pieces form a curved wall, then fold away one by one when stopped."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#73e3ff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 7,
        "default": 7
      }
    },
    "sha256": "e01121af65c905457bc03f6ea73044a37f0c133d64df1bc17a3d0d973839c650"
  },
  {
    "id": "prism-parry",
    "name": {
      "zh": "稜晶瞬擋",
      "en": "Prismatic Crystal Block"
    },
    "category": "shield",
    "description": {
      "zh": "一道亮線突然閃過，小片水晶盾擋下一擊，散出碎光後消失。",
      "en": "A bright line flashes as a small crystal shield blocks a hit and scatters light."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ffe3a0",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 4,
        "default": 4
      }
    },
    "sha256": "2401a1f9effeaa0b7336c5fceabd40e42f8a7c8a89c701f2b3836bdc5edd8a2a"
  },
  {
    "id": "astral-gate",
    "name": {
      "zh": "星紋之門",
      "en": "Gate of Astral Tracery"
    },
    "category": "portal",
    "description": {
      "zh": "發光門框一段段展開，門內星光流動，停止使用後慢慢關上。",
      "en": "A glowing doorway opens piece by piece, with flowing stars inside, then closes when stopped."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#c1b8ff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "5b049aca9598fea56eae12ee3be598241bbb00d4de82bbf2956ca9b96840180c"
  },
  {
    "id": "soul-siphon",
    "name": {
      "zh": "暗能汲流",
      "en": "Dark Energy Siphon"
    },
    "category": "beam",
    "description": {
      "zh": "一股股黑暗魔力從目標流回使用者，停止後把剩下的魔力收完。",
      "en": "Streams of dark magic flow back from the target and finish draining when stopped."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "setEndpoints"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#a883e8",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 18,
        "default": 9
      }
    },
    "sha256": "77618927d42f84961c63891dee09db3a100162c46af61159f04bd2d813de8efa"
  },
  {
    "id": "revival-bloom",
    "name": {
      "zh": "生機光綻",
      "en": "Vitality Blossom"
    },
    "category": "burst",
    "description": {
      "zh": "柔光從低處聚起，再像花朵往上綻放，適合復活或補血。",
      "en": "Soft light gathers low down and blooms upward like a flower for revival or healing."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ff8fbd",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 28,
        "default": 14
      }
    },
    "sha256": "8a628f46188bb85273552aa6debbe691dd1679e6fb45c2179d7a79939cbe71ab"
  },
  {
    "id": "frost-lance-rain",
    "name": {
      "zh": "霜矛落陣",
      "en": "Falling Frost Spear Array"
    },
    "category": "burst",
    "description": {
      "zh": "冰槍從空中接連落下，碰地後碎成小冰塊，霜痕再慢慢消失。",
      "en": "Ice spears fall one after another, shatter on landing and leave fading frost."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#a9dfff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 18,
        "default": 9
      },
      "spread": {
        "min": 0.5,
        "max": 3,
        "default": 1
      }
    },
    "sha256": "e99c0029f7ed9457c98edbba1c324af38941985544c266ecdbc3d4c1689032f5"
  },
  {
    "id": "venom-stream",
    "name": {
      "zh": "濺蝕毒流",
      "en": "Corrosive Venom Jet"
    },
    "category": "beam",
    "description": {
      "zh": "毒液往目標噴去，途中濺出水滴，停止後剩下的毒液會流完。",
      "en": "Poison sprays toward a target with splashing drops, finishing its flow when stopped."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "setEndpoints"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#acdc6f",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 1,
        "max": 16,
        "default": 8
      }
    },
    "sha256": "32778af3deeeb7805d40c18361c5d351f3e8f8d0683acd00aca37923505dc41f"
  },
  {
    "id": "painterly-grass",
    "name": {
      "zh": "風拂草地",
      "en": "Windswept Meadow"
    },
    "category": "environment",
    "description": {
      "zh": "像畫筆畫出的草地，點綴白色小花，草尖和花朵會隨風輕輕擺動。",
      "en": "Painted-looking grass dotted with white flowers sways gently in the wind."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#829544",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.75
      }
    },
    "sha256": "7d8af473fde02c97bd8f8020d0c3900c16f7629d026e43397a41ebac0f6f2159"
  },
  {
    "id": "dimensional-rend",
    "name": {
      "zh": "裂空碎斬",
      "en": "Rift-Shattering Slashes"
    },
    "category": "area",
    "description": {
      "zh": "刀光劃過時，背景像碎玻璃一樣錯開、散開，再慢慢恢復。",
      "en": "A slash makes the background split like broken glass, spread apart and slowly return."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#729dff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 4,
        "default": 2
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.3
      },
      "quantity": {
        "min": 1,
        "max": 32,
        "default": 18
      },
      "spread": {
        "min": 0.5,
        "max": 4,
        "default": 2
      },
      "panelCount": {
        "min": 0,
        "max": 32,
        "default": 9
      }
    },
    "sha256": "2528e2fcf5ca7f8521b29dc258a65d17b1b91ccf0c20d6093903742802f056db"
  },
  {
    "id": "black-hole",
    "name": {
      "zh": "渦光黑洞",
      "en": "Luminous Vortex Black Hole"
    },
    "category": "area",
    "description": {
      "zh": "黑洞周圍的亮光不斷往內捲，後面的景物也像被吸力拉彎。",
      "en": "Light spirals into a black hole while the scenery behind it appears to bend."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "medium",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ffab42",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 12,
        "default": 6
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 4,
        "default": 2
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 1
      }
    },
    "sha256": "12f10b854f8afe4e6b086d428fa96c787b60fd4375decb35c0652a3f8fd37c60"
  },
  {
    "id": "azure-sweep",
    "name": {
      "zh": "蒼刃迴斬",
      "en": "Azure Blade Sweep"
    },
    "category": "area",
    "description": {
      "zh": "藍白刀光掃出接近一整圈，停留一下後，尾巴追上前端並消失。",
      "en": "A blue-white slash sweeps almost a full circle, pauses, then closes from tail to tip."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#2878ff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "ec1fe8909a81fff5eab804b7b01fd19c33ed03dc0c2c86cb73dac79801de55b2"
  },
  {
    "id": "weapon-smear",
    "name": {
      "zh": "流光刃影",
      "en": "Gleaming Blade Trail"
    },
    "category": "area",
    "description": {
      "zh": "揮劍時留下透明的藍色光痕，停手後很快消失。",
      "en": "Swinging a sword leaves a see-through blue trail that quickly fades when you stop."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "attachWeapon",
      "detachWeapon"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#2878ff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 1,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "dccd1ee0a102d4ee93efe50ea5cd0545423eb59fcccdada0d04590ebc7fa3adb"
  },
  {
    "id": "spatial-sweep",
    "name": {
      "zh": "裂空迴斬",
      "en": "Riftblade Sweep"
    },
    "category": "area",
    "description": {
      "zh": "透明刀光掃過一圈，後面的景物被拉扯、錯開，再跟著刀光消失。",
      "en": "A clear curved slash stretches and shifts the scenery behind it, then fades away."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "medium",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#e9f5ff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "cb4f5d28c37fd84c569ae81c113beb504472b120609176ecd7e5973a918082ba"
  },
  {
    "id": "spatial-smear",
    "name": {
      "zh": "裂空刃影",
      "en": "Riftblade Trail"
    },
    "category": "area",
    "description": {
      "zh": "揮劍時留下透明光痕，讓後面的景物跟著拉彎，停手後很快消失。",
      "en": "A sword swing leaves a clear trail that bends the view behind it and quickly fades."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "medium",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "attachWeapon",
      "detachWeapon"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#e9f5ff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 1,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "b2fc5a0570efd18d3ba4d86c71bf4f611bbb12e53c8a46f5c22de46014c8dde4"
  },
  {
    "id": "darkchain-detonation",
    "name": {
      "zh": "闇鏈崩陣",
      "en": "Darkchain Sigil Rupture"
    },
    "category": "area",
    "description": {
      "zh": "魔法陣把鎖鏈和煙吸向黑球，黑球縮小後炸開，震散鎖鏈並噴出紅紫閃電。",
      "en": "Magic circles draw chains and smoke toward a dark ball, which shrinks and bursts with red-purple lightning."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "medium",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#8300ff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "240858d9f4359ebc3c58afddab60b64779d6f7a64bbce4e3f344e2b93eed31c4"
  },
  {
    "id": "electric-magic-arrow-strike",
    "name": {
      "zh": "金刃雷矢",
      "en": "Golden-Bladed Lightning Arrow"
    },
    "category": "projectile",
    "description": {
      "zh": "金色箭身纏著閃電往前飛，打中時炸出雷光與兩道光圈。",
      "en": "A golden arrow flies wrapped in lightning, bursting into flashes and two rings on impact."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "setDirection"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ffd36a",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "1f6da34782cb0ade2a487fd61ea9e3997c3066585b7c3d69bc38046d486d07f5"
  },
  {
    "id": "golden-chain-rain",
    "name": {
      "zh": "金鏈驟雨",
      "en": "Golden Chain Rain"
    },
    "category": "area",
    "description": {
      "zh": "金鏈連落三波，箭頭插地炸出金色碎片；地裂散出柔光，碎片沿裂縫緩緩浮起。",
      "en": "Golden chains fall in three waves, bursting into gold shards on contact; glowing cracks release slowly rising fragments."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ffd166",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "spriteChains": {
        "type": "boolean",
        "default": true,
        "meaning": "Axis-aligned sprite chain links with animated liquid patterns and endpoint clipping; reduces geometry, approximates close-up depth."
      },
      "quantity": {
        "min": 1,
        "max": 12,
        "default": 8
      },
      "spread": {
        "min": 0.5,
        "max": 2,
        "default": 1
      },
      "textureDensity": {
        "min": 0.25,
        "max": 3,
        "default": 0.7
      },
      "crackBloom": {
        "min": 0,
        "max": 5,
        "default": 0.15,
        "meaning": "Crack-local soft bloom strength multiplier; 0 disables the outer glow, 0.15 is the default, 1 is the original full strength, 5 is maximum. Does not change crack core, particles, source ripples or timeline."
      },
      "crackBloomSpread": {
        "min": 0.25,
        "max": 3,
        "default": 1,
        "meaning": "Width multiplier of crack-local soft glow, default 1, 0.25–3. Independent of strength; 0.20 local units at 1, scaled by size. Rising crack chips travel twice the previous height over the same lifetime."
      }
    },
    "sha256": "0223c7b6ea716acb65155b88a137da710b8b708d541dc0c4f648d3d7a252e29d"
  },
  {
    "id": "billowing-airburst",
    "name": {
      "zh": "烈焰空爆",
      "en": "Billowing Airburst"
    },
    "category": "burst",
    "description": {
      "zh": "火球在空中炸開，粗大的煙尾往四周噴出，火焰慢慢變成煙霧散去。",
      "en": "A fireball bursts in midair with thick smoke trails, then cools into fading smoke."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "prewarm"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ff7a24",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 2,
        "max": 6,
        "default": 4
      }
    },
    "sha256": "bae274bb9426cfb7abc599b0578c885742cff0d7effdfba15cbd5467f32aaed7"
  },
  {
    "id": "spell-indicator-circle",
    "name": {
      "zh": "紅色圓形預警",
      "en": "Red Circle Spell Indicator"
    },
    "category": "area",
    "description": {
      "zh": "紅色圓圈標出危險區，顏色慢慢填滿提醒攻擊將到，倒數結束後消失。",
      "en": "A red circle marks danger and fills as an attack approaches, disappearing when the countdown ends."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "reset",
      "dispose",
      "setOptions",
      "setProgress"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ff303e",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 20,
        "default": 3,
        "units": "local-scene-units",
        "meaning": "radius"
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1,
        "meaning": "decorative-flow-strength"
      },
      "warningDuration": {
        "type": "number",
        "min": 0.1,
        "max": 30,
        "default": 2,
        "units": "seconds"
      },
      "progressMode": {
        "type": "enum",
        "enum": [
          "auto",
          "manual"
        ],
        "default": "auto"
      }
    },
    "sha256": "1f4d1f287ce9887e7656198541edaf4dee4680588b49ec9a34ef7b7fd4b7644a"
  },
  {
    "id": "spell-indicator-sector",
    "name": {
      "zh": "紅色扇形預警",
      "en": "Red Sector Spell Indicator"
    },
    "category": "area",
    "description": {
      "zh": "紅色扇形標出攻擊方向，顏色慢慢填滿提醒攻擊將到，大小和角度能調整。",
      "en": "A red fan marks an attack direction and fills as it approaches. Its size and angle can change."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "reset",
      "dispose",
      "setOptions",
      "setProgress"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ff303e",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 20,
        "default": 3,
        "units": "local-scene-units",
        "meaning": "radius"
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1,
        "meaning": "decorative-flow-strength"
      },
      "angleDeg": {
        "type": "number",
        "min": 5,
        "max": 360,
        "default": 90,
        "units": "degrees"
      },
      "warningDuration": {
        "type": "number",
        "min": 0.1,
        "max": 30,
        "default": 2,
        "units": "seconds"
      },
      "progressMode": {
        "type": "enum",
        "enum": [
          "auto",
          "manual"
        ],
        "default": "auto"
      }
    },
    "sha256": "aa0f1fe63d5c62986837583f5909b7bc153b7797accccc4352a0b772cd91a7fa"
  },
  {
    "id": "spell-indicator-rectangle",
    "name": {
      "zh": "紅色長方形預警",
      "en": "Red Rectangle Spell Indicator"
    },
    "category": "area",
    "description": {
      "zh": "紅色長方形標出危險區，可從一端或中央向兩側填滿，提醒攻擊將到。",
      "en": "A red rectangle marks danger, filling from one end or from the center toward both sides before an attack."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "reset",
      "dispose",
      "setOptions",
      "setProgress"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ff303e",
        "format": "#RRGGBB"
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1,
        "meaning": "decorative-flow-strength"
      },
      "warningDuration": {
        "type": "number",
        "min": 0.1,
        "max": 30,
        "default": 2,
        "units": "seconds"
      },
      "progressMode": {
        "type": "enum",
        "enum": [
          "auto",
          "manual"
        ],
        "default": "auto"
      },
      "length": {
        "type": "number",
        "min": 0.25,
        "max": 20,
        "default": 6,
        "units": "local-scene-units"
      },
      "width": {
        "type": "number",
        "min": 0.25,
        "max": 20,
        "default": 3,
        "units": "local-scene-units"
      },
      "fillMode": {
        "type": "enum",
        "enum": [
          "forward",
          "center-out"
        ],
        "default": "forward"
      }
    },
    "sha256": "96a957c4d4b4253f42c6411044563098b9a0115c804c17d2506088ccd4921c8a"
  },
  {
    "id": "sacred-relic-descent",
    "name": {
      "zh": "聖遺物・治癒降臨",
      "en": "Sacred Relic Descent"
    },
    "category": "area",
    "description": {
      "zh": "多層白金法陣旋轉，三角錐砸地揚石，每兩秒推出水紋光波與中段煙浪。",
      "en": "A layered white-gold magic circle turns as a triangular pyramid lands with flying rocks, followed by flowing waves and raised smoke every two seconds."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "setObject"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#f5cc75",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "spread": {
        "min": 0.5,
        "max": 1.5,
        "default": 1
      }
    },
    "sha256": "54fd3ffa39d16a4599cb16d4eb169d1d729d71c77779beb32a865d4d73fb2222"
  },
  {
    "id": "impact-frame",
    "name": {
      "zh": "衝擊幀",
      "en": "Impact Frame"
    },
    "category": "screen",
    "description": {
      "zh": "命中時閃過黑白剪影與星芒，收暗後炸出大片爆光，讓重擊更有力。",
      "en": "Flash comic silhouettes and stars on a hit, then erupt from darkness into a powerful final blast."
    },
    "type": "postprocess",
    "playback": "triggered-sequence",
    "level": "high",
    "methods": [
      "trigger",
      "setCenter",
      "setDirection",
      "setSubjects",
      "setSubjectMask",
      "update",
      "reset",
      "setOptions",
      "setSize",
      "render",
      "dispose"
    ],
    "parameters": {
      "threshold": {
        "type": "number",
        "min": 0,
        "max": 1,
        "default": 0.5
      },
      "softness": {
        "type": "number",
        "min": 0,
        "max": 1,
        "default": 0.05
      },
      "strokeLength": {
        "type": "number",
        "min": 0,
        "max": 1,
        "default": 0.65
      },
      "inkDensity": {
        "type": "number",
        "min": 0,
        "max": 1,
        "default": 0.65
      },
      "backgroundSuppression": {
        "type": "number",
        "min": 0,
        "max": 1,
        "default": 0.35
      },
      "starSize": {
        "type": "number",
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "starStrength": {
        "type": "number",
        "min": 0,
        "max": 1,
        "default": 1
      },
      "sequence": {
        "type": "array",
        "minItems": 1,
        "default": [
          {
            "pose": "silhouette",
            "mode": "inverted",
            "durationMs": 66.66666666666667,
            "intensity": 1
          },
          {
            "pose": "tear",
            "mode": "monochrome",
            "durationMs": 66.66666666666667,
            "intensity": 1
          },
          {
            "pose": "burst",
            "mode": "inverted",
            "durationMs": 66.66666666666667,
            "intensity": 1
          },
          {
            "pose": "clean",
            "mode": "monochrome",
            "durationMs": 33.333333333333336,
            "intensity": 1
          },
          {
            "pose": "release",
            "mode": "inverted",
            "durationMs": 33.333333333333336,
            "intensity": 1
          },
          {
            "pose": "detonate",
            "mode": "inverted",
            "durationMs": 66.66666666666667,
            "intensity": 1
          },
          {
            "pose": "shock",
            "mode": "monochrome",
            "durationMs": 66.66666666666667,
            "intensity": 1
          }
        ],
        "items": {
          "pose": {
            "enum": [
              "silhouette",
              "tear",
              "burst",
              "cut",
              "echo",
              "clean",
              "release",
              "detonate",
              "shock"
            ]
          },
          "mode": {
            "enum": [
              "monochrome",
              "inverted",
              "original"
            ]
          },
          "durationMs": {
            "type": "number",
            "exclusiveMinimum": 0
          },
          "intensity": {
            "type": "number",
            "min": 0,
            "max": 1
          }
        }
      }
    },
    "sha256": "c5f08a9b105f304f1db760138ce0b8ad16804e123816a3762dc8514aa3c2ae6a"
  },
  {
    "id": "verdant-restoration",
    "name": {
      "zh": "森光治癒",
      "en": "Verdant Restoration"
    },
    "category": "area",
    "description": {
      "zh": "自然系治癒特效，綠色柔光與飄葉環繞目標，呈現持續恢復的狀態。",
      "en": "A nature-themed healing effect with soft green light and drifting leaves around a target, showing ongoing recovery."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "medium",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "render",
      "prepareRender",
      "setLayer"
    ],
    "parameters": {
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      }
    },
    "sha256": "245234e9815f2434071c978cb4ce9ecbd22b4fdde6add5753e9dd79f199fe388"
  },
  {
    "id": "aegis-weave",
    "name": {
      "zh": "織光護盾",
      "en": "Aegis Weave"
    },
    "category": "shield",
    "description": {
      "zh": "魔法護盾特效，透明藍色護罩環繞目標，呈現受到保護的狀態。",
      "en": "A magic shield effect with a clear blue barrier around a target, showing a protected state."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "medium",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "render",
      "prepareRender",
      "setLayer"
    ],
    "parameters": {
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      }
    },
    "sha256": "32a26f0677784c22b048c5267ebc345cf05eb4b4b55e179d2a48f419bb1e65db"
  },
  {
    "id": "sustained-arc",
    "name": {
      "zh": "連續雷流",
      "en": "Sustained Arc"
    },
    "category": "beam",
    "description": {
      "zh": "持續雷電特效，分岔電流連接施放端與目標，適合表現持續電擊。",
      "en": "A sustained lightning effect with branching currents linking the source to a target, suited to ongoing electric attacks."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "medium",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "setEndpoints",
      "render",
      "prepareRender",
      "setLayer"
    ],
    "parameters": {
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      }
    },
    "sha256": "9e2181f7c4c535c231ab69366605189a90776d1559e0386300ad82e0b5cf76c7"
  },
  {
    "id": "starblade-cataclysm",
    "name": {
      "zh": "星劍焚界",
      "en": "Starblade Cataclysm"
    },
    "category": "beam",
    "description": {
      "zh": "劍化成金色星光，升空聚成四瓣核心，再射出光束燒開熔岩裂谷。",
      "en": "A sword becomes golden stars, gathers into a four-petal core, then fires a beam that burns a lava trench."
    },
    "type": "scene-object",
    "playback": "single-shot",
    "level": "medium",
    "methods": [
      "update",
      "stop",
      "reset",
      "dispose",
      "setOptions",
      "setObject",
      "setSweepPath"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ffd35a",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      }
    },
    "sha256": "89213787f21465008fc5f3992c437461906692b25d8ecaa51d3600578f4b2647"
  },
  {
    "id": "starblade-explosion",
    "name": {
      "zh": "星焰爆破",
      "en": "Starfire Explosion"
    },
    "category": "burst",
    "description": {
      "zh": "白熱火光瞬間炸開，拋出碎石與火星，留下裂紋和翻滾濃煙。",
      "en": "White-hot fire bursts outward, throwing rocks and sparks before leaving cracks and rolling smoke."
    },
    "type": "scene-object",
    "playback": "single-shot",
    "level": "medium",
    "methods": [
      "update",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      }
    },
    "sha256": "47e54ab7530e1bef6ba71f5e13c3169a061955f9f773eab91613f1d0373c81f1"
  },
  {
    "id": "interactive-ground-fog",
    "name": {
      "zh": "互動貼地霧",
      "en": "Interactive Ground Fog"
    },
    "category": "smoke",
    "description": {
      "zh": "貼地薄霧隨推力翻捲，物體經過會留下慢慢填回的痕跡。",
      "en": "Low mist rolls with each push. Moving objects leave trails that slowly fill back in."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "medium",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "prepare",
      "render",
      "blast",
      "stir",
      "setObstacle",
      "setTerrain"
    ],
    "parameters": {
      "density": {
        "type": "number",
        "min": 0.3,
        "max": 2,
        "default": 1
      },
      "strength": {
        "type": "number",
        "min": 0.3,
        "max": 2,
        "default": 1
      },
      "swirl": {
        "type": "number",
        "min": 0,
        "max": 2,
        "default": 1
      },
      "recovery": {
        "type": "number",
        "min": 0.5,
        "max": 2,
        "default": 1
      }
    },
    "sha256": "8818728a6b36ccf211eb5aa7f5139487676c7f6c4a199d91af64f0ca32983084"
  },
  {
    "id": "rolling-fireburst",
    "name": {
      "zh": "翻焰爆破",
      "en": "Rolling Flame Burst"
    },
    "category": "burst",
    "description": {
      "zh": "大團火焰向外翻滾，逐漸變成濃煙，再從下往上破散。",
      "en": "A large fire cloud rolls outward, cools into smoke, then breaks apart from the bottom up."
    },
    "type": "scene-object",
    "playback": "single-shot",
    "level": "low",
    "methods": [
      "update",
      "reset",
      "rerollDebris",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      }
    },
    "sha256": "1e75685eb5ac3f3a12a6dd27a3bfe609644b5059bd10717165e3090de1e83e70"
  },
  {
    "id": "comic-ink-arcs",
    "name": {
      "zh": "漫畫墨弧",
      "en": "Comic Ink Arcs"
    },
    "category": "burst",
    "description": {
      "zh": "尖頭墨色圓弧向外散開，逐漸變細淡去，可切換八種筆觸。",
      "en": "Pointed ink arcs spread outward, thin and fade, with eight brush styles to choose from."
    },
    "type": "scene-object",
    "playback": "single-shot",
    "level": "medium",
    "methods": [
      "update",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "inkStyle": {
        "type": "integer",
        "min": 0,
        "max": 7,
        "default": 0,
        "labels": [
          "Clean comic arcs",
          "Brush arcs",
          "Dry-brush arcs",
          "Multiple impact arcs",
          "Calligraphy rings",
          "Fine speed arcs",
          "Ink-wash arcs",
          "Broken arcs"
        ]
      },
      "inkArcCount": {
        "type": "integer",
        "min": 0,
        "max": 32,
        "default": 9
      },
      "inkArcWidth": {
        "type": "number",
        "min": 0.25,
        "max": 3,
        "default": 0.25
      },
      "inkArcLength": {
        "type": "number",
        "min": 0.25,
        "max": 2,
        "default": 0.9
      },
      "inkRadius": {
        "type": "number",
        "min": 0.5,
        "max": 2,
        "default": 0.7
      },
      "inkSpeed": {
        "type": "number",
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "inkIrregularity": {
        "type": "number",
        "min": 0,
        "max": 1,
        "default": 0
      },
      "inkDryness": {
        "type": "number",
        "min": 0,
        "max": 1,
        "default": 0.46
      },
      "inkOpacity": {
        "type": "number",
        "min": 0.1,
        "max": 1,
        "default": 0.9
      },
      "inkArcDuration": {
        "type": "number",
        "min": 0.2,
        "max": 1.5,
        "default": 0.75
      },
      "inkFadeStart": {
        "type": "number",
        "min": 0.2,
        "max": 0.8,
        "default": 0.45
      }
    },
    "sha256": "049e853cdee7458eb444fb340d56cf9a80ab29645eb940d11e3166232f67fbc1"
  },
  {
    "id": "ice-lance-study",
    "name": {
      "zh": "冰矛飛射",
      "en": "Ice Lance"
    },
    "category": "projectile",
    "description": {
      "zh": "晶片聚攏鍛成冰矛，爆發射出，命中炸開碎冰與冰霧。",
      "en": "Crystal pieces forge an icy spear, which launches and bursts into shards and rolling frost on impact."
    },
    "type": "scene-object",
    "playback": "single-shot",
    "level": "high",
    "methods": [
      "update",
      "reset",
      "setOptions",
      "render",
      "dispose"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#d4e8ed",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "bloom": {
        "type": "number",
        "min": 0,
        "max": 3,
        "default": 1.1
      },
      "shiny": {
        "type": "number",
        "min": 0,
        "max": 3,
        "default": 1
      }
    },
    "sha256": "f97caf16350119bf4978c1d3754ed76d41b3d79fbcf16bb112766fdaf18c1fac"
  },
  {
    "id": "ice-shield-study",
    "name": {
      "zh": "冰晶護盾",
      "en": "Crystal Ice Shield"
    },
    "category": "shield",
    "description": {
      "zh": "冰板拼成弧面護盾，維持一段時間後碎落。",
      "en": "Ice plates form a curved shield, hold steady, then break apart and fall."
    },
    "type": "scene-object",
    "playback": "single-shot",
    "level": "high",
    "methods": [
      "update",
      "reset",
      "setOptions",
      "render",
      "dispose"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#d4e8ed",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "bloom": {
        "type": "number",
        "min": 0,
        "max": 3,
        "default": 1.1
      },
      "shiny": {
        "type": "number",
        "min": 0,
        "max": 3,
        "default": 1
      }
    },
    "sha256": "074dc7df317e39f05a30cacde0876eafb1ab562e831a120fa658188b5fd65587"
  },
  {
    "id": "ground-freeze-study",
    "name": {
      "zh": "地面冰封",
      "en": "Ground Ice Eruption"
    },
    "category": "area",
    "description": {
      "zh": "冰晶從地底衝出，寒氣持續翻湧，最後炸成碎冰。",
      "en": "Ice crystals erupt from the ground amid rolling cold mist, then explode into shards."
    },
    "type": "scene-object",
    "playback": "single-shot",
    "level": "high",
    "methods": [
      "update",
      "reset",
      "setOptions",
      "render",
      "dispose"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#d4e8ed",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "bloom": {
        "type": "number",
        "min": 0,
        "max": 3,
        "default": 1.1
      },
      "shiny": {
        "type": "number",
        "min": 0,
        "max": 3,
        "default": 1
      }
    },
    "sha256": "ade2236d06e48630c12367a43d21b5afebebe1c0c46dd096683f2732cba2e399"
  },
  {
    "id": "anime-flame-shield",
    "name": {
      "zh": "烈焰繞流",
      "en": "Anime Flame Flow"
    },
    "category": "beam",
    "description": {
      "zh": "火焰撞上圓球或方塊，沿表面翻捲，最後散成濃煙。",
      "en": "Flames hit a sphere or cube, curl along its surface, then fade into thick smoke."
    },
    "type": "scene-object",
    "playback": "continuous",
    "level": "medium",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "setAim",
      "render",
      "setLayerVisible"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ff761f",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      }
    },
    "sha256": "1e2214db165d006ea4466c90c97d11c80324e7bf50ae520e5e2a21a992a8cfd7"
  },
  {
    "id": "ice-pillar-skill",
    "name": {
      "zh": "冰柱突刺",
      "en": "Ice Pillar Skill"
    },
    "category": "area",
    "description": {
      "zh": "冰柱沿地面向前竄起，冒出寒霧，最後炸成四散的碎冰。",
      "en": "Ice pillars erupt forward through cold mist, then burst into scattering shards."
    },
    "type": "scene-object",
    "playback": "single-shot",
    "level": "low",
    "methods": [
      "update",
      "stop",
      "hit",
      "reset",
      "dispose",
      "setOptions",
      "shatterNow"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#22b8f0",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1,
        "meaning": "Ice rim light intensity multiplier."
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.65,
        "meaning": "Cold mist opacity; does not change pillar or shard count."
      }
    },
    "sha256": "29ed6e82bcce0f5da95cc974675916b13b9bd51475de49ee9757b7af76465522"
  },
  {
    "id": "arcane-arrow-rain",
    "name": {
      "zh": "奧術箭雨",
      "en": "Arcane Arrow Rain"
    },
    "category": "area",
    "description": {
      "zh": "箭雨落地後，每支箭齊亮白金四芒星，金羽飛散，紫色爆風掃過外圈。",
      "en": "Every fallen arrow flashes as a white-gold four-point star. Golden feathers fly skyward and a violet wave sweeps past the outer row."
    },
    "type": "scene-object",
    "playback": "single-shot",
    "level": "medium",
    "methods": [
      "update",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#9700ff",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 0.5
      },
      "quantity": {
        "min": 8,
        "max": 128,
        "default": 64,
        "meaning": "Total arcane arrows in the single cast; the center lands first and the outer ring follows. Decorative density never removes arrows."
      },
      "spread": {
        "min": 0.5,
        "max": 2,
        "default": 1,
        "meaning": "Horizontal spread of landing points (0.5-2, default 1). Does not change arrow size, fall height or timing."
      }
    },
    "sha256": "dd73691ccd6b202095be39436c35b96558c82af35f7237255fe08b6e5730de84"
  },
  {
    "id": "celestial-arrow-rain",
    "name": {
      "zh": "星穹箭雨",
      "en": "Celestial Arrow Rain"
    },
    "category": "area",
    "description": {
      "zh": "藍金法陣召來斜落的箭雨，最後一支巨箭擊地，激起光柱與裂紋。",
      "en": "Blue and gold seals summon a rain of arrows. A giant arrow strikes last, raising a pillar of light and cracking the ground."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "quantity": {
        "min": 10,
        "max": 180,
        "default": 110,
        "type": "integer",
        "meaning": "Number of regular arrows. The final giant arrow is always included separately."
      },
      "spread": {
        "min": 0.5,
        "max": 1.5,
        "default": 1,
        "meaning": "Scale of the 5.2-unit landing radius, sigils and ground waves."
      }
    },
    "sha256": "6a455fe32828e6b91a478af6822ec13be824b2db5368f280448504bff1876278"
  },
  {
    "id": "hellfire-pillar",
    "name": {
      "zh": "獄炎火柱",
      "en": "Hellfire Pillar"
    },
    "category": "area",
    "description": {
      "zh": "地面法陣炸出大片熔岩，火柱接著向前奔燒，留下發亮的裂痕。",
      "en": "Lava erupts from the magic circle, then a pillar of fire sweeps forward and leaves glowing cracks."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "medium",
    "methods": [
      "update",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "theme": {
        "type": "enum",
        "enum": [
          "hellfire",
          "abyssal",
          "violet",
          "venom"
        ],
        "default": "hellfire"
      }
    },
    "sha256": "16070530bfd910764b046c44a71d62b5f19df8a0b88951cbf53366886e2e7f1f"
  },
  {
    "id": "energy-sword-wave",
    "name": {
      "zh": "扇形劍氣",
      "en": "Energy Sword Wave"
    },
    "category": "area",
    "description": {
      "zh": "月牙劍氣呈扇形飛出，沿途劃開地面、濺起火花與碎石，適合範圍斬擊。",
      "en": "Crescent sword waves fan out, carving the ground and throwing sparks and stones. Use them for sweeping area attacks."
    },
    "type": "scene-object",
    "playback": "single-shot",
    "level": "medium",
    "methods": [
      "update",
      "reset",
      "dispose",
      "setOptions"
    ],
    "parameters": {
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1,
        "meaning": "Brightness multiplier."
      },
      "quantity": {
        "type": "integer",
        "min": 1,
        "max": 5,
        "default": 5
      },
      "spread": {
        "min": 0.25,
        "max": 2,
        "default": 1,
        "meaning": "Multiplier of a 60-degree fan; one wave travels straight ahead."
      },
      "theme": {
        "type": "enum",
        "enum": [
          "azure",
          "crimson",
          "void",
          "solar"
        ],
        "default": "azure"
      }
    },
    "sha256": "7ee6ca50a2666900ff8f35162e32dea858e0f8669c1f89fdbb536a5ee01ad552"
  },
  {
    "id": "meteor-strike",
    "name": {
      "zh": "流星墜擊",
      "en": "Meteor Strike"
    },
    "category": "area",
    "description": {
      "zh": "燃燒的流星落地炸開，濺起碎石與火花，留下濃煙和發亮的裂痕。",
      "en": "A blazing meteor crashes down, scattering rocks and sparks and leaving thick smoke and glowing cracks."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "medium",
    "methods": [
      "update",
      "reset",
      "dispose",
      "setOptions",
      "seek",
      "prewarm"
    ],
    "parameters": {
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      }
    },
    "sha256": "0e482fa7903d951c568a55dfd310e16d4f20de1cbad03007f41592076e51645a"
  },
  {
    "id": "dark-pillar-burst",
    "name": {
      "zh": "黑暗光柱爆發",
      "en": "Dark Pillar Burst"
    },
    "category": "area",
    "description": {
      "zh": "白線聚起黑色光柱，紫藍雷光撕開天空，地面三度震出碎石，適合範圍魔法。",
      "en": "White threads gather into a dark pillar. Violet lightning tears across the sky as three shockwaves send rocks flying. Use it for area spells."
    },
    "type": "scene-object",
    "playback": "single-shot",
    "level": "medium",
    "methods": [
      "update",
      "reset",
      "dispose",
      "setOptions",
      "seek"
    ],
    "parameters": {
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1,
        "meaning": "Legacy overall scale"
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "circleDiameter": {
        "min": 0.25,
        "max": 2,
        "default": 2,
        "meaning": "Ground magic circle diameter only"
      },
      "pillarHeight": {
        "min": 0.25,
        "max": 2,
        "default": 1,
        "meaning": "Column height"
      },
      "pillarWidth": {
        "min": 0.25,
        "max": 4,
        "default": 2,
        "meaning": "Column diameter"
      }
    },
    "sha256": "ba582d6d73907d57ef19a1dcc47367cd237894797dbf3b724e8ddc8d91615aaa"
  },
  {
    "id": "flame-magic-bolt",
    "name": {
      "zh": "火焰魔法彈",
      "en": "Flame Magic Bolt"
    },
    "category": "projectile",
    "description": {
      "zh": "紫紅火球拖著火焰向前飛，命中時炸出星光、火花和煙霧。",
      "en": "A violet-red fireball leaves a flaming trail and bursts into starlight, sparks, and smoke on impact."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "low",
    "methods": [
      "update",
      "reset",
      "dispose",
      "setOptions",
      "seek",
      "setCameraPosition",
      "setLayerVisible"
    ],
    "parameters": {
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      }
    },
    "sha256": "4bd82d94c43745e06895501ad53d233e78f7c628e32f136578a56b2df38b2791"
  },
  {
    "id": "lightning-fire-tornado",
    "name": {
      "zh": "雷焰龍捲",
      "en": "Lightning Fire Tornado"
    },
    "category": "area",
    "description": {
      "zh": "紅焰捲成龍捲風，藍色閃電沿外圈跳動，適合大範圍魔法。",
      "en": "A fiery tornado crackles with blue lightning around the edges, ideal for wide-area magic."
    },
    "type": "scene-object",
    "playback": "single-shot",
    "level": "medium",
    "methods": [
      "update",
      "reset",
      "dispose",
      "setOptions",
      "seek"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#d91644",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 2,
        "default": 1,
        "meaning": "Brightness multiplier."
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 1,
        "meaning": "Changes decorative embers, debris and intermittent perimeter electricity; the funnel stays intact."
      }
    },
    "sha256": "c00fb5b80913d72f722cdd4fab1f1550e36e0cd90fb3f95c5c423f6682462736"
  },
  {
    "id": "thousand-slashes",
    "name": {
      "zh": "一瞬千斬",
      "en": "Thousand Slashes"
    },
    "category": "area",
    "description": {
      "zh": "紅橙刀光接連劃過，交錯成一場斬擊風暴，在地面留下發亮的裂痕。",
      "en": "Red-orange cuts cross into a storm of blades, leaving glowing cracks in the ground."
    },
    "type": "scene-object",
    "playback": "one-shot",
    "level": "medium",
    "methods": [
      "update",
      "reset",
      "dispose",
      "setOptions",
      "seek",
      "setCameraPosition"
    ],
    "parameters": {
      "color": {
        "type": "color",
        "default": "#ff5514",
        "format": "#RRGGBB"
      },
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "detail": {
        "min": 0.25,
        "max": 4,
        "default": 2,
        "meaning": "Blade thickness multiplier."
      },
      "density": {
        "min": 0.125,
        "max": 1,
        "default": 1,
        "meaning": "Count of secondary slashes, ink strokes and ground marks."
      },
      "duration": {
        "type": "number",
        "min": 1,
        "max": 8,
        "default": 2.5,
        "unit": "seconds",
        "meaning": "Total one-shot duration at speed 1; slash cadence and the closing fade keep their own timing."
      }
    },
    "sha256": "3f8c7dfccb0c66bbbee0a296a4e5a587a4113ed819e5c6bcee84ba5eb34d089c"
  },
  {
    "id": "dark-lightning",
    "name": {
      "zh": "暗雷風暴",
      "en": "Dark Lightning"
    },
    "category": "area",
    "description": {
      "zh": "黑雲聚起紅色閃電，劈地炸出光圈與碎石，適合範圍魔法。",
      "en": "Dark clouds gather red lightning that strikes the ground, throwing out a ring of light and flying rocks."
    },
    "type": "scene-object",
    "playback": "single-shot",
    "level": "medium",
    "methods": [
      "update",
      "reset",
      "dispose",
      "setOptions",
      "seek",
      "prewarm"
    ],
    "parameters": {
      "size": {
        "min": 0.25,
        "max": 2,
        "default": 1
      },
      "speed": {
        "min": 0.25,
        "max": 2,
        "default": 1
      }
    },
    "sha256": "b0f35c076f8ccf11efa006871c3a92fe3983535e678a712e27af0aca6adb3507"
  }
];
export {loaders} from './loaders.mjs';
