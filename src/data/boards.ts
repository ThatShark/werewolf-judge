// 此檔案由 scripts/parseBoards.ts 自動自 docs/boards-raw.md 解析生成（共 143 個板子）
import type { BoardDefinition, PlayerCountFilter } from '../logic/types';

export const ALL_BOARDS: BoardDefinition[] = [
  {
    "id": "6p-classic",
    "name": "6 人局 - 經典預獵",
    "playerCount": 6,
    "playerCountFilter": "6",
    "keywords": [
      "經典預獵",
      "6人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "獵人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 2
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_3",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "confirm_only",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "(確認獵人是誰)",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "wolfKillPriority"
    ]
  },
  {
    "id": "6p-classic-2",
    "name": "6 人局 - 經典預守",
    "playerCount": 6,
    "playerCountFilter": "6",
    "keywords": [
      "經典預守",
      "6人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 2
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "wolfKillPriority"
    ]
  },
  {
    "id": "6p-miracle-merchant",
    "name": "6 人局 - 奇蹟商人",
    "playerCount": 6,
    "playerCountFilter": "6",
    "keywords": [
      "奇蹟商人",
      "6人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 2
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "miracle_merchant",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "miracle_merchant_gift",
          "actorLabel": "奇蹟商人",
          "actorRoleIds": [
            "miracle_merchant"
          ],
          "actionType": "miracle_merchant_gift",
          "openPrompt": "奇蹟商人請睜眼",
          "actionPrompt": "你選擇幸運兒和要給的禮物",
          "closePrompt": "奇蹟商人請閉眼"
        },
        {
          "stepId": "lucky_item_action",
          "actorLabel": "幸運兒",
          "actorRoleIds": [],
          "actionType": "lucky_item_action",
          "openPrompt": "幸運兒請睜眼",
          "actionPrompt": "你獲得的技能是...，請問你是否要使用技能",
          "closePrompt": "幸運兒請閉眼",
          "judgeTips": [
            "(法官走若干圈告知幸運兒是誰)"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "lucky_item_action",
          "actorLabel": "幸運兒",
          "actorRoleIds": [],
          "actionType": "lucky_item_action",
          "openPrompt": "幸運兒請睜眼",
          "actionPrompt": "請問你是否要使用技能",
          "closePrompt": "幸運兒請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "wolfKillPriority"
    ]
  },
  {
    "id": "6p-cloud-pursuit",
    "name": "6 人局 - 雲端追捕",
    "playerCount": 6,
    "playerCountFilter": "6",
    "keywords": [
      "雲端追捕",
      "6人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "平民",
      "村民",
      "預言家",
      "女巫"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 1
        },
        {
          "roleId": "wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 2
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "7p-survivor",
    "name": "7 人局 - 生還者",
    "playerCount": 7,
    "playerCountFilter": "7",
    "keywords": [
      "生還者",
      "7人",
      "小狼",
      "普通狼人",
      "狼人",
      "白狼王",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 1
        },
        {
          "roleId": "white_wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 1
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "white_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "white_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "7p-survivor-qa-1",
        "question": "被女巫毒的獵人可以開槍嗎？",
        "answer": "不能開槍。",
        "relatedRoleIds": [
          "hunter",
          "witch"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "8p-ragnarok",
    "name": "8 人局 - 諸神黃昏",
    "playerCount": 8,
    "playerCountFilter": "8",
    "keywords": [
      "諸神黃昏",
      "8人",
      "狼王",
      "黑狼王",
      "白狼王",
      "惡靈騎士",
      "預言家",
      "女巫",
      "獵人",
      "守衛",
      "白痴",
      "愚者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf_king",
          "count": 1
        },
        {
          "roleId": "white_wolf_king",
          "count": 1
        },
        {
          "roleId": "evil_knight",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf_king",
            "white_wolf_king",
            "evil_knight"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "白痴",
          "actorRoleIds": [
            "idiot"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白痴請睜眼",
          "actionPrompt": "(確認白痴是誰)",
          "closePrompt": "白痴請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf_king",
            "white_wolf_king",
            "evil_knight"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "8p-ragnarok-qa-1",
        "question": "守衛守護惡靈騎士會死亡嗎？",
        "answer": "不會。",
        "relatedRoleIds": [
          "evil_knight",
          "guard"
        ]
      },
      {
        "id": "8p-ragnarok-qa-2",
        "question": "惡靈騎士會被奶穿嗎？",
        "answer": "不會，惡靈騎士無法自刀，所以不會被女巫救。",
        "relatedRoleIds": [
          "evil_knight",
          "witch"
        ]
      },
      {
        "id": "8p-ragnarok-qa-3",
        "question": "守衛守護的對象被惡靈反傷會死嗎？",
        "answer": "會，守衛只防狼刀。",
        "relatedRoleIds": [
          "guard"
        ]
      },
      {
        "id": "8p-ragnarok-qa-4",
        "question": "獵人白天被放逐出局，開槍能帶走惡靈騎士嗎？",
        "answer": "可以，白天開的槍不屬於夜間傷害。",
        "relatedRoleIds": [
          "evil_knight",
          "hunter"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "idiotNeedsExtraKill",
      "wolfKillPriority"
    ]
  },
  {
    "id": "8p-doomsday-outlaws",
    "name": "8 人局 - 末日狂徒",
    "playerCount": 8,
    "playerCountFilter": "8",
    "keywords": [
      "末日狂徒",
      "8人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "守衛",
      "騎士"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 2
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "knight",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "8p-doomsday-outlaws-qa-1",
        "question": "騎士能與自己決鬥嗎？",
        "answer": "不行。",
        "relatedRoleIds": [
          "knight"
        ]
      },
      {
        "id": "8p-doomsday-outlaws-qa-2",
        "question": "騎士能撞(決鬥)被守衛守護的玩家嗎？",
        "answer": "可以。",
        "relatedRoleIds": [
          "guard",
          "knight"
        ]
      }
    ],
    "supportedRuleToggles": [
      "wolfKillPriority"
    ]
  },
  {
    "id": "9p-classic",
    "name": "9 人局 - 經典",
    "playerCount": 9,
    "playerCountFilter": "9",
    "keywords": [
      "經典",
      "9人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "9p-seed-wolf",
    "name": "9 人局 - 種狼",
    "playerCount": 9,
    "playerCountFilter": "9",
    "keywords": [
      "種狼",
      "9人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "高級平民",
      "高級村民",
      "熊",
      "馴熊師",
      "女巫",
      "獵人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 1
        },
        {
          "roleId": "seed_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "senior_villager",
          "count": 1
        },
        {
          "roleId": "bear",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "seed_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺或感染，請選擇要擊殺或感染的玩家",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "(法官走若干圈告知感染者是誰)"
          ]
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "熊",
          "actorRoleIds": [
            "bear"
          ],
          "actionType": "confirm_only",
          "openPrompt": "熊請睜眼",
          "actionPrompt": "(確認熊是誰)",
          "closePrompt": "熊請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "seed_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺或感染，請選擇要擊殺或感染的玩家",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "(法官走若干圈告知感染者是誰)"
          ]
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "9p-seed-wolf-qa-1",
        "question": "種狼若選擇開感染技能，女巫會如何得知刀口？",
        "answer": "顯示空刀。",
        "relatedRoleIds": [
          "witch",
          "seed_wolf"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "9p-war-wolf-knight",
    "name": "9 人局 - 戰狼騎士",
    "playerCount": 9,
    "playerCountFilter": "9",
    "keywords": [
      "戰狼騎士",
      "9人",
      "小狼",
      "普通狼人",
      "狼人",
      "戰狼",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "騎士"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "war_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "knight",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "war_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "war_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "9p-war-wolf-knight-qa-1",
        "question": "騎士能與自己決鬥嗎？",
        "answer": "不行。",
        "relatedRoleIds": [
          "knight"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "9p-board-kxb4iz",
    "name": "9 人局 - 眾神之戰",
    "playerCount": 9,
    "playerCountFilter": "9",
    "keywords": [
      "眾神之戰",
      "9人",
      "狼王",
      "黑狼王",
      "白狼王",
      "種狼",
      "熊",
      "馴熊師",
      "女巫",
      "獵人",
      "企鵝",
      "名媛",
      "騎士"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf_king",
          "count": 1
        },
        {
          "roleId": "white_wolf_king",
          "count": 1
        },
        {
          "roleId": "seed_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "bear",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "penguin",
          "count": 1
        },
        {
          "roleId": "socialite",
          "count": 1
        },
        {
          "roleId": "knight",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "penguin_freeze",
          "actorLabel": "企鵝",
          "actorRoleIds": [
            "penguin"
          ],
          "actionType": "penguin_freeze",
          "openPrompt": "企鵝請睜眼",
          "actionPrompt": "請選擇要冰凍的玩家",
          "closePrompt": "企鵝請閉眼"
        },
        {
          "stepId": "socialite_favor",
          "actorLabel": "名媛",
          "actorRoleIds": [
            "socialite"
          ],
          "actionType": "socialite_favor",
          "openPrompt": "名媛請睜眼",
          "actionPrompt": "請選擇要寵幸的玩家",
          "closePrompt": "名媛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf_king",
            "white_wolf_king",
            "seed_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺或感染，請選擇要擊殺或感染的玩家",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "(法官走若干圈告知感染者是誰)"
          ]
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "熊",
          "actorRoleIds": [
            "bear"
          ],
          "actionType": "confirm_only",
          "openPrompt": "熊請睜眼",
          "actionPrompt": "(確認熊是誰)",
          "closePrompt": "熊請閉眼"
        },
        {
          "stepId": "step_7",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "penguin_freeze",
          "actorLabel": "企鵝",
          "actorRoleIds": [
            "penguin"
          ],
          "actionType": "penguin_freeze",
          "openPrompt": "企鵝請睜眼",
          "actionPrompt": "請選擇要冰凍的玩家",
          "closePrompt": "企鵝請閉眼"
        },
        {
          "stepId": "socialite_favor",
          "actorLabel": "名媛",
          "actorRoleIds": [
            "socialite"
          ],
          "actionType": "socialite_favor",
          "openPrompt": "名媛請睜眼",
          "actionPrompt": "請選擇要寵幸的玩家",
          "closePrompt": "名媛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf_king",
            "white_wolf_king",
            "seed_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺或感染，請選擇要擊殺或感染的玩家",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "(法官走若干圈告知感染者是誰)"
          ]
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "9p-board-e9uyvs",
    "name": "9 人局 - 動物園",
    "playerCount": 9,
    "playerCountFilter": "9",
    "keywords": [
      "動物園",
      "9人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "兔兔",
      "熊",
      "馴熊師",
      "企鵝",
      "烏鴉"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "bunny",
          "count": 3
        },
        {
          "roleId": "bear",
          "count": 1
        },
        {
          "roleId": "penguin",
          "count": 1
        },
        {
          "roleId": "crow",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "penguin_freeze",
          "actorLabel": "企鵝",
          "actorRoleIds": [
            "penguin"
          ],
          "actionType": "penguin_freeze",
          "openPrompt": "企鵝請睜眼",
          "actionPrompt": "請選擇要冰凍的玩家",
          "closePrompt": "企鵝請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "crow_curse",
          "actorLabel": "烏鴉",
          "actorRoleIds": [
            "crow"
          ],
          "actionType": "crow_curse",
          "openPrompt": "烏鴉請睜眼",
          "actionPrompt": "請選擇要詛咒的玩家",
          "closePrompt": "烏鴉請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "熊",
          "actorRoleIds": [
            "bear"
          ],
          "actionType": "confirm_only",
          "openPrompt": "熊請睜眼",
          "actionPrompt": "(確認熊是誰)",
          "closePrompt": "熊請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "penguin_freeze",
          "actorLabel": "企鵝",
          "actorRoleIds": [
            "penguin"
          ],
          "actionType": "penguin_freeze",
          "openPrompt": "企鵝請睜眼",
          "actionPrompt": "請選擇要冰凍的玩家",
          "closePrompt": "企鵝請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "crow_curse",
          "actorLabel": "烏鴉",
          "actorRoleIds": [
            "crow"
          ],
          "actionType": "crow_curse",
          "openPrompt": "烏鴉請睜眼",
          "actionPrompt": "請選擇要詛咒的玩家",
          "closePrompt": "烏鴉請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "wolfKillPriority"
    ]
  },
  {
    "id": "9p-pandora",
    "name": "9 人局 - 潘朵拉",
    "playerCount": 9,
    "playerCountFilter": "9",
    "keywords": [
      "潘朵拉",
      "9人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼美人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "wolf_beauty",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 2
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "pandora",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "pandora_gift",
          "actorLabel": "潘朵拉",
          "actorRoleIds": [
            "pandora"
          ],
          "actionType": "pandora_gift",
          "openPrompt": "潘朵拉請睜眼",
          "actionPrompt": "請選擇要給予魔盒的對象",
          "closePrompt": "潘朵拉請閉眼"
        },
        {
          "stepId": "step_7",
          "actorLabel": "獲贈者",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "獲贈者請睜眼",
          "actionPrompt": "請得到的技能為...，請問你要使用嗎？",
          "closePrompt": "獲贈者請閉眼",
          "judgeTips": [
            "(法官走若干圈告知獲贈者是誰)",
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "pandora_gift",
          "actorLabel": "潘朵拉",
          "actorRoleIds": [
            "pandora"
          ],
          "actionType": "pandora_gift",
          "openPrompt": "潘朵拉請睜眼",
          "actionPrompt": "請選擇要給予魔盒的對象",
          "closePrompt": "潘朵拉請閉眼"
        },
        {
          "stepId": "step_7",
          "actorLabel": "今晚的獲贈者",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "今晚的獲贈者請睜眼",
          "actionPrompt": "請得到的技能為...，請問你要使用嗎？",
          "closePrompt": "今晚的獲贈者請閉眼",
          "judgeTips": [
            "(法官走若干圈告知獲贈者是誰)",
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "step_8",
          "actorLabel": "第一個白天的獲贈者",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "第一個白天的獲贈者請睜眼",
          "actionPrompt": "請問你要使用技能嗎？",
          "closePrompt": "第一個白天的獲贈者請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "step_9",
          "actorLabel": "第一晚的獲贈者",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "第一晚的獲贈者請睜眼",
          "actionPrompt": "請問你要使用技能嗎？",
          "closePrompt": "第一晚的獲贈者請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        }
      ]
    },
    "qaList": [
      {
        "id": "9p-pandora-qa-1",
        "question": "若一個人同時中了魔盒的刀和狼刀，女巫使用解藥救的了嗎？",
        "answer": "不行，即便女巫使用解藥，仍會死於魔盒的刀，因為魔盒的刀無視解藥。",
        "relatedRoleIds": [
          "witch"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "10p-classic",
    "name": "10 人局 - 經典",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "經典",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-idiot",
    "name": "10 人局 - 白痴",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "白痴",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "愚者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "白痴",
          "actorRoleIds": [
            "idiot"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白痴請睜眼",
          "actionPrompt": "(確認白痴是誰)",
          "closePrompt": "白痴請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "idiotNeedsExtraKill",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-masked-wolf",
    "name": "10 人局 - 假面之夜",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "假面之夜",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛",
      "白痴",
      "愚者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        }
      ]
    },
    "isFlexibleComposition": true,
    "compositionNote": "神職五選三：從預言家、女巫、獵人、守衛、白痴中選出 3 名上場。",
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "白痴",
          "actorRoleIds": [
            "idiot"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白痴請睜眼",
          "actionPrompt": "(確認白痴是誰)",
          "closePrompt": "白痴請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "idiotNeedsExtraKill",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-wolf-king-white-wolf-king-knight",
    "name": "10 人局 - 白狼王騎士",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "白狼王騎士",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "白狼王",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "守衛",
      "騎士"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "white_wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "knight",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "white_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "white_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-wolf-king-white-wolf-king-knight-qa-1",
        "question": "騎士能與自己決鬥嗎？",
        "answer": "不行。",
        "relatedRoleIds": [
          "knight"
        ]
      },
      {
        "id": "10p-wolf-king-white-wolf-king-knight-qa-2",
        "question": "騎士能在上警階段發起決鬥嗎？",
        "answer": "不能。",
        "relatedRoleIds": [
          "knight"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-wolf-beauty-knight",
    "name": "10 人局 - 狼美人騎士",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "狼美人騎士",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼美人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "守衛",
      "騎士"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "wolf_beauty",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "knight",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-wolf-beauty-knight-qa-1",
        "question": "騎士能與自己決鬥嗎？",
        "answer": "不行。",
        "relatedRoleIds": [
          "knight"
        ]
      },
      {
        "id": "10p-wolf-beauty-knight-qa-2",
        "question": "騎士能在上警階段發起決鬥嗎？",
        "answer": "不能。",
        "relatedRoleIds": [
          "knight"
        ]
      },
      {
        "id": "10p-wolf-beauty-knight-qa-3",
        "question": "如果狼美人作為最後一狼出局，此時他魅惑的人是否出局？",
        "answer": "會，並會先判斷是否達成屠邊條件。",
        "relatedRoleIds": [
          "wolf_beauty"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-snow-wolf-knight",
    "name": "10 人局 - 雪狼騎士",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "雪狼騎士",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "雪狼",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "騎士"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "snow_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "knight",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "snow_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "snow_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-snow-wolf-knight-qa-1",
        "question": "騎士能與自己決鬥嗎？",
        "answer": "不行。",
        "relatedRoleIds": [
          "knight"
        ]
      },
      {
        "id": "10p-snow-wolf-knight-qa-2",
        "question": "騎士與雪狼決鬥結果如何？",
        "answer": "雪狼會死掉，直接進入夜晚。",
        "relatedRoleIds": [
          "knight",
          "snow_wolf"
        ]
      },
      {
        "id": "10p-snow-wolf-knight-qa-3",
        "question": "騎士能在上警階段發起決鬥嗎？",
        "answer": "不能。",
        "relatedRoleIds": [
          "knight"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-hidden-wolf-knight",
    "name": "10 人局 - 隱狼騎士",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "隱狼騎士",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "隱狼",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "騎士"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "hidden_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "knight",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "隱狼",
          "actorRoleIds": [
            "hidden_wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "隱狼請睜眼",
          "actionPrompt": "你的狼隊友為...",
          "closePrompt": "隱狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "step_1",
          "actorLabel": "隱狼",
          "actorRoleIds": [
            "hidden_wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "隱狼請睜眼",
          "actionPrompt": "今晚的帶刀手勢為...",
          "closePrompt": "隱狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-hidden-wolf-knight-qa-1",
        "question": "騎士能與自己決鬥嗎？",
        "answer": "不行。",
        "relatedRoleIds": [
          "knight"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-board-13wywxf",
    "name": "10 人局 - 血月獵魔",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "血月獵魔",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "血月使徒",
      "赤月使徒",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵魔人",
      "白痴",
      "愚者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "blood_moon_apostle",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "demon_hunter",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "blood_moon_apostle"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "獵魔人",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "confirm_only",
          "openPrompt": "獵魔人請睜眼",
          "actionPrompt": "(確認獵魔人是誰)",
          "closePrompt": "獵魔人請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "白痴",
          "actorRoleIds": [
            "idiot"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白痴請睜眼",
          "actionPrompt": "(確認白痴是誰)",
          "closePrompt": "白痴請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "blood_moon_apostle"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "demon_hunter_hunt",
          "actorLabel": "獵魔人",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "demon_hunter_hunt",
          "openPrompt": "獵魔人請睜眼",
          "actionPrompt": "請選擇要狩獵的目標",
          "closePrompt": "獵魔人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-board-13wywxf-qa-1",
        "question": "獵魔人選擇狩獵血月使徒，獵魔人會死嗎？",
        "answer": "不會，血月使徒不會反傷，所以結果為血月使徒死亡。",
        "relatedRoleIds": [
          "blood_moon_apostle",
          "demon_hunter"
        ]
      },
      {
        "id": "10p-board-13wywxf-qa-2",
        "question": "血月使徒自爆，天亮獵人死亡能開槍嗎？",
        "answer": "這板子沒有獵人。",
        "relatedRoleIds": [
          "blood_moon_apostle"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "idiotNeedsExtraKill",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-nightmare",
    "name": "10 人局 - 夢魘攝夢(網易版)",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "夢魘攝夢(網易版)",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "夢魘",
      "噩夢之影",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "攝夢人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 1
        },
        {
          "roleId": "wolf_king",
          "count": 1
        },
        {
          "roleId": "nightmare",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "nightmare_fear",
          "actorLabel": "夢魘",
          "actorRoleIds": [
            "nightmare"
          ],
          "actionType": "nightmare_fear",
          "openPrompt": "夢魘請睜眼",
          "actionPrompt": "請選擇要恐懼的玩家",
          "closePrompt": "夢魘請閉眼"
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king",
            "nightmare"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "nightmare_fear",
          "actorLabel": "夢魘",
          "actorRoleIds": [
            "nightmare"
          ],
          "actionType": "nightmare_fear",
          "openPrompt": "夢魘請睜眼",
          "actionPrompt": "請選擇要恐懼的玩家",
          "closePrompt": "夢魘請閉眼"
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king",
            "nightmare"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-nightmare-qa-1",
        "question": "如果女巫救了夢遊者會被奶穿嗎？",
        "answer": "不會。",
        "relatedRoleIds": [
          "witch"
        ]
      },
      {
        "id": "10p-nightmare-qa-2",
        "question": "如果攝夢人第一天和第三天攝夢同一個對象，第二晚被恐懼，夢遊者會出局嗎？",
        "answer": "不會，要連續兩晚對同一個人攝夢才會死亡。",
        "relatedRoleIds": [
          "dream_catcher"
        ]
      },
      {
        "id": "10p-nightmare-qa-3",
        "question": "夢魘晚上恐懼獵人，白天獵人被放逐能開槍嗎？",
        "answer": "可以開槍。",
        "relatedRoleIds": [
          "hunter",
          "nightmare"
        ]
      },
      {
        "id": "10p-nightmare-qa-4",
        "question": "夢魘晚上恐懼狼王，白天狼王被放逐能開槍嗎？",
        "answer": "可以開槍。",
        "relatedRoleIds": [
          "wolf_king",
          "nightmare"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-nightmare-2",
    "name": "10 人局 - 夢魘攝夢(私版)",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "夢魘攝夢(私版)",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "夢魘",
      "噩夢之影",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "攝夢人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "nightmare",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "nightmare_fear",
          "actorLabel": "夢魘",
          "actorRoleIds": [
            "nightmare"
          ],
          "actionType": "nightmare_fear",
          "openPrompt": "夢魘請睜眼",
          "actionPrompt": "請選擇要恐懼的玩家",
          "closePrompt": "夢魘請閉眼"
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "nightmare"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "nightmare_fear",
          "actorLabel": "夢魘",
          "actorRoleIds": [
            "nightmare"
          ],
          "actionType": "nightmare_fear",
          "openPrompt": "夢魘請睜眼",
          "actionPrompt": "請選擇要恐懼的玩家",
          "closePrompt": "夢魘請閉眼"
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "nightmare"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-nightmare-2-qa-1",
        "question": "如果女巫救了夢遊者會被奶穿嗎？",
        "answer": "不會。",
        "relatedRoleIds": [
          "witch"
        ]
      },
      {
        "id": "10p-nightmare-2-qa-2",
        "question": "如果攝夢人第一天和第三天攝夢同一個對象，第二晚被恐懼，夢遊者會出局嗎？",
        "answer": "不會，要連續兩晚對同一個人攝夢才會死亡。",
        "relatedRoleIds": [
          "dream_catcher"
        ]
      },
      {
        "id": "10p-nightmare-2-qa-3",
        "question": "夢魘晚上恐懼獵人，白天獵人被放逐能開槍嗎？",
        "answer": "可以開槍。",
        "relatedRoleIds": [
          "hunter",
          "nightmare"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-mech-wolf-psychic",
    "name": "10 人局 - 機械狼通靈師 / 鏡隱迷蹤",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "機械狼",
      "覺醒隱狼",
      "通靈師",
      "魔鏡少女",
      "鏡隱迷蹤",
      "10人"
    ],
    "automationLevel": "full",
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "mech_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "psychic",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "mech_wolf_learn",
          "actorLabel": "機械狼",
          "actorRoleIds": [
            "mech_wolf"
          ],
          "actionType": "mech_wolf_learn",
          "openPrompt": "機械狼請睜眼",
          "actionPrompt": "請選擇要學習的對象",
          "closePrompt": "機械狼請閉眼",
          "judgeTips": [
            "不可學習自己；若開啟首夜強制學習開關則不可跳過。"
          ]
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼",
          "judgeTips": [
            "不可連續兩晚守護同一人；普通守衛之盾無法擋毒。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "首夜僅小狼睜眼，機械狼尚未入隊。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "同守同救會觸發奶穿；解藥與毒藥不可同晚使用。"
          ]
        },
        {
          "stepId": "psychic_check",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "psychic_check",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "通靈師請閉眼",
          "judgeTips": [
            "機械狼學習前查驗為「機械狼」，學習後查驗顯示其所學對象的真實身分。"
          ]
        },
        {
          "stepId": "mech_wolf_reveal_skill",
          "actorLabel": "機械狼",
          "actorRoleIds": [
            "mech_wolf"
          ],
          "actionType": "mech_wolf_reveal_skill",
          "openPrompt": "機械狼請睜眼",
          "actionPrompt": "你學習到的技能為...",
          "closePrompt": "機械狼請閉眼",
          "judgeTips": [
            "告知機械狼學到的角色技能，自第二晚起生效。"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼",
          "judgeTips": [
            "不可連續兩晚守護同一名玩家。"
          ]
        },
        {
          "stepId": "mech_wolf_night_action",
          "actorLabel": "機械狼",
          "actorRoleIds": [
            "mech_wolf"
          ],
          "actionType": "mech_wolf_night_action",
          "openPrompt": "機械狼請睜眼",
          "actionPrompt": "今晚的入隊手勢為...\n請問你要使用技能嗎？",
          "closePrompt": "機械狼請閉眼",
          "judgeTips": [
            "所有小狼皆淘汰後比出已入隊手勢並解鎖狼刀（若學到小狼則同時解鎖雙刀）。",
            "學女巫僅 1 瓶毒；學守衛之機械盾可擋女巫毒藥且不可連守。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "mech_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "機械狼僅在所有小狼皆出局入隊後才參與本步驟點刀。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "注意機械狼若學守衛，其機械盾可以擋住女巫的毒藥。"
          ]
        },
        {
          "stepId": "psychic_check",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "psychic_check",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "通靈師請閉眼",
          "judgeTips": [
            "查驗存活玩家真實身分；已學習之機械狼顯示其所學角色身分。"
          ]
        }
      ]
    },
    "qaList": [
      {
        "id": "mwp-qa-1",
        "question": "通靈師查驗機械狼會看到什麼身分？",
        "answer": "機械狼尚未學習前會查驗為「機械狼」；學習後則動態顯示其所學習對象的真實身分。",
        "relatedRoleIds": [
          "mech_wolf",
          "psychic"
        ]
      },
      {
        "id": "mwp-qa-2",
        "question": "機械狼學到女巫、守衛、小狼各有什麼特殊規則？",
        "answer": "學女巫僅獲得 1 瓶毒藥（無解藥）；學守衛的機械盾可以擋住女巫毒藥（仍不可連守）；學小狼的額外一刀須等所有小狼皆出局入隊後才能開啟（形成雙刀）。",
        "relatedRoleIds": [
          "mech_wolf",
          "witch",
          "guard",
          "wolf"
        ]
      },
      {
        "id": "mwp-qa-3",
        "question": "機械狼可以自爆嗎？什麼時候入狼隊？",
        "answer": "機械狼全程不可自爆，初期不入狼隊；當場上所有小狼皆淘汰且機械狼仍存活時，自動入隊並解鎖狼刀。",
        "relatedRoleIds": [
          "mech_wolf",
          "wolf"
        ]
      },
      {
        "id": "mwp-qa-4",
        "question": "小狼全部出局後好人就贏了嗎？",
        "answer": "不是，機械狼屬於狼人陣營，好人須淘汰所有小狼與機械狼方能獲勝。",
        "relatedRoleIds": [
          "mech_wolf"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "mechWolfForceLearnNight1",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-miracle-merchant",
    "name": "10 人局 - 奇蹟商人",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "奇蹟商人",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "miracle_merchant",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "miracle_merchant_gift",
          "actorLabel": "奇蹟商人",
          "actorRoleIds": [
            "miracle_merchant"
          ],
          "actionType": "miracle_merchant_gift",
          "openPrompt": "奇蹟商人請睜眼",
          "actionPrompt": "你選擇幸運兒和要給的禮物",
          "closePrompt": "奇蹟商人請閉眼"
        },
        {
          "stepId": "lucky_item_action",
          "actorLabel": "幸運兒",
          "actorRoleIds": [],
          "actionType": "lucky_item_action",
          "openPrompt": "幸運兒請睜眼",
          "actionPrompt": "你獲得的技能是...，請問你是否要使用技能",
          "closePrompt": "幸運兒請閉眼",
          "judgeTips": [
            "(法官走若干圈告知幸運兒是誰)"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "lucky_item_action",
          "actorLabel": "幸運兒",
          "actorRoleIds": [],
          "actionType": "lucky_item_action",
          "openPrompt": "幸運兒請睜眼",
          "actionPrompt": "請問你是否要使用技能",
          "closePrompt": "幸運兒請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-miracle-merchant-qa-1",
        "question": "幸運兒的盾會「奶穿」嗎？",
        "answer": "會，如果女巫還沒有用掉解藥的話有機會。",
        "relatedRoleIds": [
          "witch"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-wolf-king-awakened-wolf-king",
    "name": "10 人局 - 覺醒狼王奇商",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "覺醒狼王奇商",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "覺醒狼王",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "奇蹟商人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "awakened_wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "miracle_merchant",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "awakened_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "awakened_wolf_king_give_gun",
          "actorLabel": "覺醒狼王",
          "actorRoleIds": [
            "awakened_wolf_king"
          ],
          "actionType": "awakened_wolf_king_give_gun",
          "openPrompt": "覺醒狼王請睜眼",
          "actionPrompt": "請選擇要分槍的對象",
          "closePrompt": "覺醒狼王請閉眼"
        },
        {
          "stepId": "step_3",
          "actorLabel": "小狼",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "小狼請睜眼",
          "actionPrompt": "他被分到了槍",
          "closePrompt": "小狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "miracle_merchant_gift",
          "actorLabel": "奇蹟商人",
          "actorRoleIds": [
            "miracle_merchant"
          ],
          "actionType": "miracle_merchant_gift",
          "openPrompt": "奇蹟商人請睜眼",
          "actionPrompt": "你選擇幸運兒和要給的禮物",
          "closePrompt": "奇蹟商人請閉眼"
        },
        {
          "stepId": "lucky_item_action",
          "actorLabel": "幸運兒",
          "actorRoleIds": [],
          "actionType": "lucky_item_action",
          "openPrompt": "幸運兒請睜眼",
          "actionPrompt": "你獲得的技能是...，請問你是否要使用技能",
          "closePrompt": "幸運兒請閉眼",
          "judgeTips": [
            "(法官走若干圈告知幸運兒是誰)"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "awakened_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "awakened_wolf_king_give_gun",
          "actorLabel": "覺醒狼王",
          "actorRoleIds": [
            "awakened_wolf_king"
          ],
          "actionType": "awakened_wolf_king_give_gun",
          "openPrompt": "覺醒狼王請睜眼",
          "actionPrompt": "請選擇要分槍的對象",
          "closePrompt": "覺醒狼王請閉眼"
        },
        {
          "stepId": "step_3",
          "actorLabel": "小狼",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "小狼請睜眼",
          "actionPrompt": "他被分到了槍",
          "closePrompt": "小狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "lucky_item_action",
          "actorLabel": "幸運兒",
          "actorRoleIds": [],
          "actionType": "lucky_item_action",
          "openPrompt": "幸運兒請睜眼",
          "actionPrompt": "請問你是否要使用技能",
          "closePrompt": "幸運兒請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-wolf-king-awakened-wolf-king-qa-1",
        "question": "幸運兒的盾會「奶穿」嗎？",
        "answer": "會，如果女巫還沒有用掉解藥的話有機會。",
        "relatedRoleIds": [
          "witch"
        ]
      },
      {
        "id": "10p-wolf-king-awakened-wolf-king-qa-2",
        "question": "覺醒狼王帶著兩把槍時被放逐能開兩次槍嗎？",
        "answer": "可以。",
        "relatedRoleIds": [
          "awakened_wolf_king"
        ]
      },
      {
        "id": "10p-wolf-king-awakened-wolf-king-qa-3",
        "question": "小狼能帶著兩把槍嗎？",
        "answer": "可以，但覺醒狼王需要要花兩個晚上分槍給他。",
        "relatedRoleIds": [
          "awakened_wolf_king",
          "wolf"
        ]
      },
      {
        "id": "10p-wolf-king-awakened-wolf-king-qa-4",
        "question": "帶著槍的小狼自爆能帶人嗎？",
        "answer": "不行，自爆不能開槍。",
        "relatedRoleIds": [
          "wolf"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-board-yjr1j3",
    "name": "10 人局 - 尋香識命",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "尋香識命",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "尋香魅影",
      "平民",
      "村民",
      "覺醒預言家",
      "女巫",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "scent_phantom",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "awakened_seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "scent_phantom_link",
          "actorLabel": "尋香魅影",
          "actorRoleIds": [
            "scent_phantom"
          ],
          "actionType": "scent_phantom_link",
          "openPrompt": "尋香魅影請睜眼",
          "actionPrompt": "你其中的一位狼隊友為...\n請選擇要綁定的兩位玩家",
          "closePrompt": "尋香魅影請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "awakened_seer_check",
          "actorLabel": "覺醒預言家",
          "actorRoleIds": [
            "awakened_seer"
          ],
          "actionType": "awakened_seer_check",
          "openPrompt": "覺醒預言家請睜眼",
          "actionPrompt": "請選擇要查驗的兩位玩家，他們的結果是...",
          "closePrompt": "覺醒預言家請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "scent_phantom_link",
          "actorLabel": "尋香魅影",
          "actorRoleIds": [
            "scent_phantom"
          ],
          "actionType": "scent_phantom_link",
          "openPrompt": "尋香魅影請睜眼",
          "actionPrompt": "今晚的入隊手勢為...\n請選擇要綁定的兩位玩家",
          "closePrompt": "尋香魅影請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "awakened_seer_check",
          "actorLabel": "覺醒預言家",
          "actorRoleIds": [
            "awakened_seer"
          ],
          "actionType": "awakened_seer_check",
          "openPrompt": "覺醒預言家請睜眼",
          "actionPrompt": "請選擇要查驗的兩位玩家，他們的結果是...",
          "closePrompt": "覺醒預言家請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-board-zm108y",
    "name": "10 人局 - 暗夜星辰",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "暗夜星辰",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "覺醒狼美人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "覺醒獵人",
      "白痴",
      "愚者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "awakened_wolf_beauty",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "awakened_hunter",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "step_1",
          "actorLabel": "守衛",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "awakened_wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "awakened_wolf_beauty_charm",
          "actorLabel": "覺醒狼美人",
          "actorRoleIds": [
            "awakened_wolf_beauty"
          ],
          "actionType": "awakened_wolf_beauty_charm",
          "openPrompt": "覺醒狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "覺醒狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "覺醒獵人",
          "actorRoleIds": [
            "awakened_hunter"
          ],
          "actionType": "confirm_only",
          "openPrompt": "覺醒獵人請睜眼",
          "actionPrompt": "(確認覺醒獵人是誰)",
          "closePrompt": "覺醒獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "step_1",
          "actorLabel": "守衛",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "awakened_wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "awakened_wolf_beauty_charm",
          "actorLabel": "覺醒狼美人",
          "actorRoleIds": [
            "awakened_wolf_beauty"
          ],
          "actionType": "awakened_wolf_beauty_charm",
          "openPrompt": "覺醒狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "覺醒狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "idiotNeedsExtraKill",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-board-1468z48",
    "name": "10 人局 - 覺石覺攝",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "覺石覺攝",
      "10人",
      "狼王",
      "黑狼王",
      "覺醒石像鬼",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "覺醒攝夢人",
      "守墓人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf_king",
          "count": 1
        },
        {
          "roleId": "awakened_gargoyle",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "awakened_dream_catcher",
          "count": 1
        },
        {
          "roleId": "gravekeeper",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "awakened_dream_catcher_dream",
          "actorLabel": "覺醒攝夢人",
          "actorRoleIds": [
            "awakened_dream_catcher"
          ],
          "actionType": "awakened_dream_catcher_dream",
          "openPrompt": "覺醒攝夢人請睜眼",
          "actionPrompt": "請選擇要夢語的玩家",
          "closePrompt": "覺醒攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "awakened_gargoyle_convert",
          "actorLabel": "覺醒石像鬼",
          "actorRoleIds": [
            "awakened_gargoyle"
          ],
          "actionType": "awakened_gargoyle_convert",
          "openPrompt": "覺醒石像鬼請睜眼",
          "actionPrompt": "請選擇轉化的玩家",
          "closePrompt": "覺醒石像鬼請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "守墓人",
          "actorRoleIds": [
            "gravekeeper"
          ],
          "actionType": "confirm_only",
          "openPrompt": "守墓人請睜眼",
          "actionPrompt": "(確認守墓人是誰)",
          "closePrompt": "守墓人請閉眼"
        },
        {
          "stepId": "awakened_dream_catcher_judge",
          "actorLabel": "覺醒攝夢人",
          "actorRoleIds": [
            "awakened_dream_catcher"
          ],
          "actionType": "awakened_dream_catcher_judge",
          "openPrompt": "覺醒攝夢人請睜眼",
          "actionPrompt": "該玩家今晚是否有行動",
          "closePrompt": "覺醒攝夢人請閉眼",
          "judgeTips": [
            "(法官走若干圈告知轉化者是誰)"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "awakened_dream_catcher_dream",
          "actorLabel": "覺醒攝夢人",
          "actorRoleIds": [
            "awakened_dream_catcher"
          ],
          "actionType": "awakened_dream_catcher_dream",
          "openPrompt": "覺醒攝夢人請睜眼",
          "actionPrompt": "請選擇要夢語的玩家",
          "closePrompt": "覺醒攝夢人請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "轉化者",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "轉化者請睜眼",
          "actionPrompt": "今晚的入隊手勢為...",
          "closePrompt": "轉化者請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "gravekeeper_check",
          "actorLabel": "守墓人",
          "actorRoleIds": [
            "gravekeeper"
          ],
          "actionType": "gravekeeper_check",
          "openPrompt": "守墓人請睜眼",
          "actionPrompt": "昨天被放逐玩家的身分是...",
          "closePrompt": "守墓人請閉眼"
        },
        {
          "stepId": "awakened_dream_catcher_judge",
          "actorLabel": "覺醒攝夢人",
          "actorRoleIds": [
            "awakened_dream_catcher"
          ],
          "actionType": "awakened_dream_catcher_judge",
          "openPrompt": "覺醒攝夢人請睜眼",
          "actionPrompt": "該玩家今晚是否有行動\n是否要讓該玩家出局",
          "closePrompt": "覺醒攝夢人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-board-1468z48-qa-1",
        "question": "如果女巫救了夢語者會被奶穿嗎？",
        "answer": "不會。",
        "relatedRoleIds": [
          "witch"
        ]
      },
      {
        "id": "10p-board-1468z48-qa-2",
        "question": "如果狼隊空刀，但覺醒石像鬼有轉化別人，那覺醒石像鬼有行動嗎？",
        "answer": "有行動。",
        "relatedRoleIds": [
          "awakened_gargoyle"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-witch-awakened-witch",
    "name": "10 人局 - 覺醒女巫",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "覺醒女巫",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "覺醒狼王",
      "平民",
      "村民",
      "預言家",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "awakened_wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "awakened_witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "awakened_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "awakened_wolf_king_give_gun",
          "actorLabel": "覺醒狼王",
          "actorRoleIds": [
            "awakened_wolf_king"
          ],
          "actionType": "awakened_wolf_king_give_gun",
          "openPrompt": "覺醒狼王請睜眼",
          "actionPrompt": "請選擇要分槍的對象",
          "closePrompt": "覺醒狼王請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "小狼",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "小狼請睜眼",
          "actionPrompt": "他被分到了槍",
          "closePrompt": "小狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "awakened_witch_action",
          "actorLabel": "覺醒女巫",
          "actorRoleIds": [
            "awakened_witch"
          ],
          "actionType": "awakened_witch_action",
          "openPrompt": "覺醒女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？請選擇你的協助者",
          "closePrompt": "覺醒女巫請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "協助者",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "協助者請睜眼",
          "actionPrompt": "他要被投毒了，協助者是否同意？",
          "closePrompt": "協助者請閉眼",
          "judgeTips": [
            "(法官走若干圈告知協助者是誰)",
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "awakened_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "awakened_wolf_king_give_gun",
          "actorLabel": "覺醒狼王",
          "actorRoleIds": [
            "awakened_wolf_king"
          ],
          "actionType": "awakened_wolf_king_give_gun",
          "openPrompt": "覺醒狼王請睜眼",
          "actionPrompt": "請選擇要分槍的對象",
          "closePrompt": "覺醒狼王請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "小狼",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "小狼請睜眼",
          "actionPrompt": "他被分到了槍",
          "closePrompt": "小狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "awakened_witch_action",
          "actorLabel": "覺醒女巫",
          "actorRoleIds": [
            "awakened_witch"
          ],
          "actionType": "awakened_witch_action",
          "openPrompt": "覺醒女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？請選擇你的協助者",
          "closePrompt": "覺醒女巫請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "協助者",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "協助者請睜眼",
          "actionPrompt": "他要被投毒了，協助者是否同意？",
          "closePrompt": "協助者請閉眼",
          "judgeTips": [
            "(法官走若干圈告知協助者是誰)",
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-witch-awakened-witch-qa-1",
        "question": "覺醒狼王帶著兩把槍時被放逐能開兩次槍嗎？",
        "answer": "可以。",
        "relatedRoleIds": [
          "awakened_wolf_king"
        ]
      },
      {
        "id": "10p-witch-awakened-witch-qa-2",
        "question": "小狼能帶著兩把槍嗎？",
        "answer": "可以，但覺醒狼王需要要花兩個晚上分槍給他。",
        "relatedRoleIds": [
          "awakened_wolf_king",
          "wolf"
        ]
      },
      {
        "id": "10p-witch-awakened-witch-qa-3",
        "question": "帶著槍的小狼自爆能帶人嗎？",
        "answer": "不行，自爆不能開槍。",
        "relatedRoleIds": [
          "wolf"
        ]
      },
      {
        "id": "10p-witch-awakened-witch-qa-4",
        "question": "被投毒的人能當協助者嗎？",
        "answer": "理論上可以。"
      }
    ],
    "supportedRuleToggles": [
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-board-10c9sqq",
    "name": "10 人局 - 永序之輪",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "永序之輪",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "蝕時狼妃",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "定序王子"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "time_eclipse_consort",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "sequence_prince",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "time_eclipse_consort"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "time_eclipse_lock",
          "actorLabel": "蝕時狼妃",
          "actorRoleIds": [
            "time_eclipse_consort"
          ],
          "actionType": "time_eclipse_lock",
          "openPrompt": "蝕時狼妃請睜眼",
          "actionPrompt": "請選擇要封鎖的玩家",
          "closePrompt": "蝕時狼妃請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "定序王子",
          "actorRoleIds": [
            "sequence_prince"
          ],
          "actionType": "confirm_only",
          "openPrompt": "定序王子請睜眼",
          "actionPrompt": "(確認定序王子是誰)",
          "closePrompt": "定序王子請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "time_eclipse_consort"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "time_eclipse_lock",
          "actorLabel": "蝕時狼妃",
          "actorRoleIds": [
            "time_eclipse_consort"
          ],
          "actionType": "time_eclipse_lock",
          "openPrompt": "蝕時狼妃請睜眼",
          "actionPrompt": "你的技能手勢為...請選擇要封鎖的玩家",
          "closePrompt": "蝕時狼妃請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-board-11aiiid",
    "name": "10 人局 - 獵日逐光",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "獵日逐光",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "蝕日侍女",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "流光伯爵"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "eclipse_maid",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "radiant_earl",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "eclipse_maid"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "eclipse_maid_devour",
          "actorLabel": "蝕日侍女",
          "actorRoleIds": [
            "eclipse_maid"
          ],
          "actionType": "eclipse_maid_devour",
          "openPrompt": "蝕日侍女請睜眼",
          "actionPrompt": "你的狼隊友為...",
          "closePrompt": "蝕日侍女請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "流光伯爵",
          "actorRoleIds": [
            "radiant_earl"
          ],
          "actionType": "confirm_only",
          "openPrompt": "流光伯爵請睜眼",
          "actionPrompt": "(確認流光伯爵是誰)",
          "closePrompt": "流光伯爵請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "eclipse_maid_devour",
          "actorLabel": "蝕日侍女",
          "actorRoleIds": [
            "eclipse_maid"
          ],
          "actionType": "eclipse_maid_devour",
          "openPrompt": "蝕日侍女請睜眼",
          "actionPrompt": "請選擇要吞噬的目標，\n你偷到的技能為...，請問你要使用嗎？",
          "closePrompt": "蝕日侍女請閉眼"
        },
        {
          "stepId": "radiant_earl_shield",
          "actorLabel": "流光伯爵",
          "actorRoleIds": [
            "radiant_earl"
          ],
          "actionType": "radiant_earl_shield",
          "openPrompt": "流光伯爵請睜眼",
          "actionPrompt": "今晚的技能狀態為...\n請選擇要庇護的玩家",
          "closePrompt": "流光伯爵請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "eclipse_maid"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "今晚的技能狀態為...\n昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "今晚的技能狀態為...\n請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-board-11aiiid-qa-1",
        "question": "如果蝕日侍女吞噬被庇護的預言家，蝕日侍女是否吞噬到查驗？",
        "answer": "有，但是白天蝕日侍女就會死亡。",
        "relatedRoleIds": [
          "eclipse_maid",
          "seer"
        ]
      },
      {
        "id": "10p-board-11aiiid-qa-2",
        "question": "如果蝕日侍女吞噬流光伯爵，蝕日侍女是否吞噬到庇護？",
        "answer": "有，可以庇護自己以外的任何一人，但是白天蝕日侍女就會死亡。",
        "relatedRoleIds": [
          "eclipse_maid",
          "radiant_earl"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-board-149pwdx",
    "name": "10 人局 - 覺醒之夜",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "覺醒之夜",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "夜之貴族",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "覺醒白痴",
      "覺醒愚者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "night_noble",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "awakened_idiot",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "awakened_idiot_shield",
          "actorLabel": "覺醒白痴",
          "actorRoleIds": [
            "awakened_idiot"
          ],
          "actionType": "awakened_idiot_shield",
          "openPrompt": "覺醒白痴請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "覺醒白痴請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "night_noble"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "awakened_idiot_shield",
          "actorLabel": "覺醒白痴",
          "actorRoleIds": [
            "awakened_idiot"
          ],
          "actionType": "awakened_idiot_shield",
          "openPrompt": "覺醒白痴請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "覺醒白痴請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "night_noble"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "night_noble_servant",
          "actorLabel": "夜之貴族",
          "actorRoleIds": [
            "night_noble"
          ],
          "actionType": "night_noble_servant",
          "openPrompt": "夜之貴族請睜眼",
          "actionPrompt": "請選擇要成為夜僕的玩家",
          "closePrompt": "夜之貴族請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-board-12kdffu",
    "name": "10 人局 - 純白夜影",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "純白夜影",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼巫",
      "平民",
      "村民",
      "純白之女",
      "女巫",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "wolf_witch",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "pure_white_maiden",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_witch"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "pure_white_check",
          "actorLabel": "純白之女",
          "actorRoleIds": [
            "pure_white_maiden"
          ],
          "actionType": "pure_white_check",
          "openPrompt": "純白之女請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "純白之女請閉眼"
        },
        {
          "stepId": "wolf_witch_check",
          "actorLabel": "狼巫",
          "actorRoleIds": [
            "wolf_witch"
          ],
          "actionType": "wolf_witch_check",
          "openPrompt": "狼巫請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "狼巫請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_witch"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_witch_check",
          "actorLabel": "狼巫",
          "actorRoleIds": [
            "wolf_witch"
          ],
          "actionType": "wolf_witch_check",
          "openPrompt": "狼巫請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "狼巫請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "pure_white_check",
          "actorLabel": "純白之女",
          "actorRoleIds": [
            "pure_white_maiden"
          ],
          "actionType": "pure_white_check",
          "openPrompt": "純白之女請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "純白之女請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-board-12kdffu-qa-1",
        "question": "若在同一個夜晚，純白之女查驗到的狼巫剛好是最後一狼，而狼巫也查驗到最後一神純白之女，此時的勝負為何？",
        "answer": "此狀況視為「狼刀在先」，所以狼人陣營獲勝。",
        "relatedRoleIds": [
          "pure_white_maiden",
          "wolf",
          "wolf_witch"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-board-znal43",
    "name": "10 人局 - 時波之亂",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "時波之亂",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "寂夜導師",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "白晝學者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "silent_night_mentor",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "daylight_scholar",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "step_1",
          "actorLabel": "白晝學者",
          "actorRoleIds": [
            "daylight_scholar"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白晝學者請睜眼",
          "actionPrompt": "(確認白晝學者是誰)",
          "closePrompt": "白晝學者請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "寂夜導師",
          "actorRoleIds": [
            "silent_night_mentor"
          ],
          "actionType": "confirm_only",
          "openPrompt": "寂夜導師請睜眼",
          "actionPrompt": "(確認寂夜導師是誰)",
          "closePrompt": "寂夜導師請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "silent_night_mentor"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "daylight_scholar_action",
          "actorLabel": "白晝學者",
          "actorRoleIds": [
            "daylight_scholar"
          ],
          "actionType": "daylight_scholar_action",
          "openPrompt": "白晝學者請睜眼",
          "actionPrompt": "請問你要對誰使用增幅或削弱",
          "closePrompt": "白晝學者請閉眼"
        },
        {
          "stepId": "silent_night_mentor_action",
          "actorLabel": "寂夜導師",
          "actorRoleIds": [
            "silent_night_mentor"
          ],
          "actionType": "silent_night_mentor_action",
          "openPrompt": "寂夜導師請睜眼",
          "actionPrompt": "請問你要對誰使用增幅或削弱",
          "closePrompt": "寂夜導師請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "silent_night_mentor"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "今晚的技能數量為\n請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "今晚的技能數量為\n昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "今晚的技能數量為\n請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-board-znal43-qa-1",
        "question": "女巫被增幅會多一個解藥嗎？",
        "answer": "不行，只有毒藥能多一個。",
        "relatedRoleIds": [
          "witch"
        ]
      },
      {
        "id": "10p-board-znal43-qa-2",
        "question": "女巫被削弱能用解藥嗎？",
        "answer": "可以，只有毒藥無法使用。",
        "relatedRoleIds": [
          "witch"
        ]
      },
      {
        "id": "10p-board-znal43-qa-3",
        "question": "守衛被增幅會下一晚是否因為不能連守而失去兩個能守護的對象？",
        "answer": "增幅帶來的額外守護無需遵守「不能連續兩晚守護同一人」的規定。"
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-board-11cingk",
    "name": "10 人局 - 猩紅蜂舞",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "猩紅蜂舞",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "猩紅狼王",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "守衛",
      "蜂之狂獵"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "scarlet_wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "bee_wild_hunt",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "scarlet_wolf_king_attach",
          "actorLabel": "猩紅狼王",
          "actorRoleIds": [
            "scarlet_wolf_king"
          ],
          "actionType": "scarlet_wolf_king_attach",
          "openPrompt": "猩紅狼王請睜眼",
          "actionPrompt": "請選擇要附著的玩家",
          "closePrompt": "猩紅狼王請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "scarlet_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "蜂之狂獵",
          "actorRoleIds": [
            "bee_wild_hunt"
          ],
          "actionType": "confirm_only",
          "openPrompt": "蜂之狂獵請睜眼",
          "actionPrompt": "(確認蜂之狂獵是誰)",
          "closePrompt": "蜂之狂獵請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "scarlet_wolf_king_attach",
          "actorLabel": "猩紅狼王",
          "actorRoleIds": [
            "scarlet_wolf_king"
          ],
          "actionType": "scarlet_wolf_king_attach",
          "openPrompt": "猩紅狼王請睜眼",
          "actionPrompt": "請選擇要附著的玩家\n今晚的帶刀手勢是...",
          "closePrompt": "猩紅狼王請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "scarlet_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "bee_wild_hunt_sting",
          "actorLabel": "蜂之狂獵",
          "actorRoleIds": [
            "bee_wild_hunt"
          ],
          "actionType": "bee_wild_hunt_sting",
          "openPrompt": "蜂之狂獵請睜眼",
          "actionPrompt": "請選擇要蜂刺的目標",
          "closePrompt": "蜂之狂獵請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-misty-crow",
    "name": "10 人局 - 迷霧鴉影",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "迷霧鴉影",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼鴉之爪",
      "平民",
      "村民",
      "預言家",
      "煉金魔女",
      "攝夢人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "wolf_raven_claw",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "alchemy_witch",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "alchemy_witch_fog",
          "actorLabel": "煉金魔女",
          "actorRoleIds": [
            "alchemy_witch"
          ],
          "actionType": "alchemy_witch_fog",
          "openPrompt": "煉金魔女請睜眼",
          "actionPrompt": "是否使用未明之霧，你要對誰使用",
          "closePrompt": "煉金魔女請閉眼"
        },
        {
          "stepId": "step_3",
          "actorLabel": "狼鴉之爪",
          "actorRoleIds": [
            "wolf_raven_claw"
          ],
          "actionType": "confirm_only",
          "openPrompt": "狼鴉之爪請睜眼",
          "actionPrompt": "(確認狼鴉之爪是誰)",
          "closePrompt": "狼鴉之爪請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_raven_claw"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "狼鴉之爪是...\n擊殺限制為...，請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "alchemy_witch_snake",
          "actorLabel": "煉金魔女",
          "actorRoleIds": [
            "alchemy_witch"
          ],
          "actionType": "alchemy_witch_snake",
          "openPrompt": "煉金魔女請睜眼",
          "actionPrompt": "昨晚他被殺死了",
          "closePrompt": "煉金魔女請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "alchemy_witch_fog",
          "actorLabel": "煉金魔女",
          "actorRoleIds": [
            "alchemy_witch"
          ],
          "actionType": "alchemy_witch_fog",
          "openPrompt": "煉金魔女請睜眼",
          "actionPrompt": "是否使用未明之霧，你要對誰使用",
          "closePrompt": "煉金魔女請閉眼"
        },
        {
          "stepId": "step_3",
          "actorLabel": "狼鴉之爪",
          "actorRoleIds": [
            "wolf_raven_claw"
          ],
          "actionType": "confirm_only",
          "openPrompt": "狼鴉之爪請睜眼",
          "actionPrompt": "今晚的帶刀手勢為...",
          "closePrompt": "狼鴉之爪請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_raven_claw"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "擊殺限制為...，請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_raven_claw_kill",
          "actorLabel": "狼鴉之爪",
          "actorRoleIds": [
            "wolf_raven_claw"
          ],
          "actionType": "wolf_raven_claw_kill",
          "openPrompt": "狼鴉之爪請睜眼",
          "actionPrompt": "今晚的無敵刀手勢為...，請選擇擊殺的目標",
          "closePrompt": "狼鴉之爪請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "alchemy_witch_snake",
          "actorLabel": "煉金魔女",
          "actorRoleIds": [
            "alchemy_witch"
          ],
          "actionType": "alchemy_witch_snake",
          "openPrompt": "煉金魔女請睜眼",
          "actionPrompt": "昨晚他被殺死了",
          "closePrompt": "煉金魔女請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-animal-dream",
    "name": "10 人局 - 動物夢境",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "動物夢境",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼美人",
      "羊駝",
      "熊",
      "馴熊師",
      "子狐",
      "河豚"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "wolf_beauty",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "alpaca",
          "count": 4
        },
        {
          "roleId": "bear",
          "count": 1
        },
        {
          "roleId": "fox_cub",
          "count": 1
        },
        {
          "roleId": "pufferfish",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "step_1",
          "actorLabel": "子狐",
          "actorRoleIds": [
            "fox_cub"
          ],
          "actionType": "confirm_only",
          "openPrompt": "子狐請睜眼",
          "actionPrompt": "(確認子狐是誰)",
          "closePrompt": "子狐請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_beauty"
          ],
          "actionType": "confirm_only",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "(確認狼人、狼美人分別是誰)",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "step_3",
          "actorLabel": "熊",
          "actorRoleIds": [
            "bear"
          ],
          "actionType": "confirm_only",
          "openPrompt": "熊請睜眼",
          "actionPrompt": "(確認熊是誰)",
          "closePrompt": "熊請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "河豚",
          "actorRoleIds": [
            "pufferfish"
          ],
          "actionType": "confirm_only",
          "openPrompt": "河豚請睜眼",
          "actionPrompt": "(確認河豚是誰)",
          "closePrompt": "河豚請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "fox_cub_charm",
          "actorLabel": "子狐",
          "actorRoleIds": [
            "fox_cub"
          ],
          "actionType": "fox_cub_charm",
          "openPrompt": "子狐請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "子狐請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-cupid",
    "name": "10 人局 - 邱比特奇緣",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "邱比特奇緣",
      "10人",
      "狼王",
      "黑狼王",
      "夢魘",
      "噩夢之影",
      "蝕時狼妃",
      "預言家",
      "女巫",
      "獵人",
      "攝夢人",
      "烏鴉",
      "邱比特",
      "混血兒",
      "暗戀者",
      "孤獨少女"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf_king",
          "count": 1
        },
        {
          "roleId": "nightmare",
          "count": 1
        },
        {
          "roleId": "time_eclipse_consort",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        },
        {
          "roleId": "crow",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "cupid",
          "count": 1
        },
        {
          "roleId": "hybrid",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "hybrid_choose",
          "actorLabel": "混血兒",
          "actorRoleIds": [
            "hybrid"
          ],
          "actionType": "hybrid_choose",
          "openPrompt": "混血兒請睜眼",
          "actionPrompt": "請選擇你要混的玩家",
          "closePrompt": "混血兒請閉眼"
        },
        {
          "stepId": "cupid_link",
          "actorLabel": "邱比特",
          "actorRoleIds": [
            "cupid"
          ],
          "actionType": "cupid_link",
          "openPrompt": "邱比特請睜眼",
          "actionPrompt": "請選擇情侶",
          "closePrompt": "邱比特請閉眼"
        },
        {
          "stepId": "step_3",
          "actorLabel": "情侶",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "情侶請睜眼",
          "actionPrompt": "請確認彼此",
          "closePrompt": "情侶請閉眼",
          "judgeTips": [
            "(法官走若干圈告知情侶分別是誰)"
          ]
        },
        {
          "stepId": "nightmare_fear",
          "actorLabel": "夢魘",
          "actorRoleIds": [
            "nightmare"
          ],
          "actionType": "nightmare_fear",
          "openPrompt": "夢魘請睜眼",
          "actionPrompt": "請選擇要恐懼的玩家",
          "closePrompt": "夢魘請閉眼"
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf_king",
            "nightmare",
            "time_eclipse_consort"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "time_eclipse_lock",
          "actorLabel": "蝕時狼妃",
          "actorRoleIds": [
            "time_eclipse_consort"
          ],
          "actionType": "time_eclipse_lock",
          "openPrompt": "蝕時狼妃請睜眼",
          "actionPrompt": "請選擇要封鎖的玩家",
          "closePrompt": "蝕時狼妃請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "crow_curse",
          "actorLabel": "烏鴉",
          "actorRoleIds": [
            "crow"
          ],
          "actionType": "crow_curse",
          "openPrompt": "烏鴉請睜眼",
          "actionPrompt": "請選擇要詛咒的玩家",
          "closePrompt": "烏鴉請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "nightmare_fear",
          "actorLabel": "夢魘",
          "actorRoleIds": [
            "nightmare"
          ],
          "actionType": "nightmare_fear",
          "openPrompt": "夢魘請睜眼",
          "actionPrompt": "請選擇要恐懼的玩家",
          "closePrompt": "夢魘請閉眼"
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf_king",
            "nightmare",
            "time_eclipse_consort"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "time_eclipse_lock",
          "actorLabel": "蝕時狼妃",
          "actorRoleIds": [
            "time_eclipse_consort"
          ],
          "actionType": "time_eclipse_lock",
          "openPrompt": "蝕時狼妃請睜眼",
          "actionPrompt": "請選擇要封鎖的玩家",
          "closePrompt": "蝕時狼妃請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "crow_curse",
          "actorLabel": "烏鴉",
          "actorRoleIds": [
            "crow"
          ],
          "actionType": "crow_curse",
          "openPrompt": "烏鴉請睜眼",
          "actionPrompt": "請選擇要詛咒的玩家",
          "closePrompt": "烏鴉請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-cupid-qa-1",
        "question": "如果混血兒混狼人，但是狼人進鍊子，獲勝條件為何？",
        "answer": "如果鍊子是狼狼鍊就是狼人陣營，如果是人狼鍊就是第三方陣營。",
        "relatedRoleIds": [
          "hybrid"
        ]
      },
      {
        "id": "10p-cupid-qa-2",
        "question": "如果混血兒混邱比特，獲勝條件為何？",
        "answer": "如果鍊子是狼狼鍊就是狼人陣營，如果是人狼鍊就是第三方陣營。",
        "relatedRoleIds": [
          "cupid",
          "hybrid"
        ]
      },
      {
        "id": "10p-cupid-qa-3",
        "question": "如果混血兒進鍊子，恰好混鍊子中另一位，獲勝條件為何？",
        "answer": "如果對方是狼就是人狼鍊為第三方陣營，如果對方是好人就是好人陣營。",
        "relatedRoleIds": [
          "hybrid"
        ]
      },
      {
        "id": "10p-cupid-qa-4",
        "question": "如果混血兒混狼人，同時與好人進鍊子，獲勝條件為何？",
        "answer": "此時依然為狼人陣營。",
        "relatedRoleIds": [
          "hybrid"
        ]
      },
      {
        "id": "10p-cupid-qa-5",
        "question": "守衛守護被蝕時狼妃封鎖的人會被視為自守，那下一晚還能自守嗎？",
        "answer": "可以，但是不能守護上一晚被封鎖的玩家。",
        "relatedRoleIds": [
          "time_eclipse_consort"
        ]
      },
      {
        "id": "10p-cupid-qa-6",
        "question": "若狼隊刀了蝕時狼妃夜晚封鎖的目標，而守衛女巫同守同救，會發生什麼？",
        "answer": "若該目標不是守衛，守衛的守護被反彈，視為該目標被狼刀後被女巫救，因此不會出局。若該目標是守衛，守衛的守護被狼妃反彈後依舊作用於自身，仍視為同守同救，因此被奶穿出局。",
        "relatedRoleIds": [
          "time_eclipse_consort",
          "witch"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "10p-hybrid",
    "name": "10 人局 - 混血兒",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "混血兒",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "暗戀者",
      "孤獨少女"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "hybrid",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "hybrid_choose",
          "actorLabel": "混血兒",
          "actorRoleIds": [
            "hybrid"
          ],
          "actionType": "hybrid_choose",
          "openPrompt": "混血兒請睜眼",
          "actionPrompt": "請選擇你要混的玩家",
          "closePrompt": "混血兒請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-hybrid-qa-1",
        "question": "混血兒混到好人算是平民還是神職？",
        "answer": "原則上是平民，但是狼人屠民不用使混血兒出局。",
        "relatedRoleIds": [
          "hybrid",
          "wolf",
          "villager"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "10p-wind-espionage",
    "name": "10 人局 - 風聲諜影",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "風聲諜影",
      "10人",
      "覺醒石像鬼",
      "預言家",
      "通靈師",
      "魔鏡少女",
      "熊",
      "馴熊師",
      "女巫",
      "獵人",
      "河豚",
      "攝夢人",
      "白貓"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "awakened_gargoyle",
          "count": 2
        }
      ],
      "good": [
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "psychic",
          "count": 1
        },
        {
          "roleId": "bear",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "pufferfish",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        },
        {
          "roleId": "white_cat",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "awakened_gargoyle"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "awakened_gargoyle_convert",
          "actorLabel": "覺醒石像鬼 A",
          "actorRoleIds": [
            "awakened_gargoyle"
          ],
          "actionType": "awakened_gargoyle_convert",
          "openPrompt": "覺醒石像鬼 A 請睜眼",
          "actionPrompt": "請選擇要轉化的玩家",
          "closePrompt": "覺醒石像鬼 A 請閉眼"
        },
        {
          "stepId": "awakened_gargoyle_convert_2",
          "actorLabel": "覺醒石像鬼 B",
          "actorRoleIds": [
            "awakened_gargoyle"
          ],
          "actionType": "awakened_gargoyle_convert",
          "openPrompt": "覺醒石像鬼 B 請睜眼",
          "actionPrompt": "請選擇要轉化的玩家",
          "closePrompt": "覺醒石像鬼 B 請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_8",
          "actorLabel": "熊",
          "actorRoleIds": [
            "bear"
          ],
          "actionType": "confirm_only",
          "openPrompt": "熊請睜眼",
          "actionPrompt": "(確認熊是誰)",
          "closePrompt": "熊請閉眼"
        },
        {
          "stepId": "step_9",
          "actorLabel": "河豚",
          "actorRoleIds": [
            "pufferfish"
          ],
          "actionType": "confirm_only",
          "openPrompt": "河豚請睜眼",
          "actionPrompt": "(確認河豚是誰)",
          "closePrompt": "河豚請閉眼"
        },
        {
          "stepId": "step_10",
          "actorLabel": "白貓",
          "actorRoleIds": [
            "white_cat"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白貓請睜眼",
          "actionPrompt": "(確認白貓是誰)",
          "closePrompt": "白貓請閉眼"
        },
        {
          "stepId": "psychic_check",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "psychic_check",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "通靈師請閉眼",
          "judgeTips": [
            "(法官走若干圈告知轉化者 A 和轉化者 B 是誰)"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "轉化者 A",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "轉化者 A 請睜眼",
          "actionPrompt": "今晚的入隊手勢為...",
          "closePrompt": "轉化者 A 請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "step_3",
          "actorLabel": "轉化者 B",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "轉化者 B 請睜眼",
          "actionPrompt": "今晚的入隊手勢為...",
          "closePrompt": "轉化者 B 請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "awakened_gargoyle"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "psychic_check",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "psychic_check",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "通靈師請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-wind-espionage-qa-1",
        "question": "如果狼隊只剩兩位轉化者怎麼辦？",
        "answer": "狼隊必須要只剩下最後一位才能入狼隊刀人，否則會卡刀，沒人能刀人。"
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-board-15uqrqo",
    "name": "10 人局 - 雲端追蹤",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "雲端追蹤",
      "10人",
      "狼美人",
      "機械狼",
      "覺醒隱狼",
      "預言家",
      "覺醒預言家",
      "通靈師",
      "魔鏡少女",
      "純白之女",
      "女巫",
      "獵人",
      "咒狐",
      "混血兒",
      "暗戀者",
      "孤獨少女"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf_beauty",
          "count": 1
        },
        {
          "roleId": "mech_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "awakened_seer",
          "count": 1
        },
        {
          "roleId": "psychic",
          "count": 1
        },
        {
          "roleId": "pure_white_maiden",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "cursed_fox",
          "count": 1
        },
        {
          "roleId": "hybrid",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "hybrid_choose",
          "actorLabel": "混血兒",
          "actorRoleIds": [
            "hybrid"
          ],
          "actionType": "hybrid_choose",
          "openPrompt": "混血兒請睜眼",
          "actionPrompt": "請選擇你要混的玩家",
          "closePrompt": "混血兒請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "咒狐",
          "actorRoleIds": [
            "cursed_fox"
          ],
          "actionType": "confirm_only",
          "openPrompt": "咒狐請睜眼",
          "actionPrompt": "(確認咒狐是誰)",
          "closePrompt": "咒狐請閉眼"
        },
        {
          "stepId": "mech_wolf_learn",
          "actorLabel": "機械狼",
          "actorRoleIds": [
            "mech_wolf"
          ],
          "actionType": "mech_wolf_learn",
          "openPrompt": "機械狼請睜眼",
          "actionPrompt": "請選擇要學習的對象",
          "closePrompt": "機械狼請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "awakened_seer_check",
          "actorLabel": "覺醒預言家",
          "actorRoleIds": [
            "awakened_seer"
          ],
          "actionType": "awakened_seer_check",
          "openPrompt": "覺醒預言家請睜眼",
          "actionPrompt": "請選擇要查驗的兩位玩家，他們的結果是...",
          "closePrompt": "覺醒預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "psychic_check",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "psychic_check",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "通靈師請閉眼"
        },
        {
          "stepId": "pure_white_check",
          "actorLabel": "純白之女",
          "actorRoleIds": [
            "pure_white_maiden"
          ],
          "actionType": "pure_white_check",
          "openPrompt": "純白之女請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "純白之女請閉眼"
        },
        {
          "stepId": "mech_wolf_reveal_skill",
          "actorLabel": "機械狼",
          "actorRoleIds": [
            "mech_wolf"
          ],
          "actionType": "mech_wolf_reveal_skill",
          "openPrompt": "機械狼請睜眼",
          "actionPrompt": "你學習到的技能為...",
          "closePrompt": "機械狼請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "mech_wolf_night_action",
          "actorLabel": "機械狼",
          "actorRoleIds": [
            "mech_wolf"
          ],
          "actionType": "mech_wolf_night_action",
          "openPrompt": "機械狼請睜眼",
          "actionPrompt": "今晚的入隊手勢為...\n請問你要使用技能嗎？",
          "closePrompt": "機械狼請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "awakened_seer_check",
          "actorLabel": "覺醒預言家",
          "actorRoleIds": [
            "awakened_seer"
          ],
          "actionType": "awakened_seer_check",
          "openPrompt": "覺醒預言家請睜眼",
          "actionPrompt": "請選擇要查驗的兩位玩家，他們的結果是...",
          "closePrompt": "覺醒預言家請閉眼"
        },
        {
          "stepId": "psychic_check",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "psychic_check",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "通靈師請閉眼"
        },
        {
          "stepId": "pure_white_check",
          "actorLabel": "純白之女",
          "actorRoleIds": [
            "pure_white_maiden"
          ],
          "actionType": "pure_white_check",
          "openPrompt": "純白之女請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "純白之女請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-board-15uqrqo-qa-1",
        "question": "如果最後一狼和咒狐出局誰獲勝？",
        "answer": "視為咒狐獲勝，最後一民或最後一神和咒狐出局也是同樣道理，咒狐獲勝。",
        "relatedRoleIds": [
          "cursed_fox"
        ]
      },
      {
        "id": "10p-board-15uqrqo-qa-2",
        "question": "如果純白之女查驗機械狼會如何？",
        "answer": "如果機械狼尚未學習其他身分或學到狼人陣營則會出局，否則僅會顯示機械狼學習的好人身分。",
        "relatedRoleIds": [
          "pure_white_maiden",
          "mech_wolf"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "mechWolfForceLearnNight1",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "10p-awakened-lonely-girl",
    "name": "10 人局 - 覺醒孤獨少女",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "覺醒孤獨少女",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "攝夢人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "awakened_lonely_girl",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "awakened_lonely_girl_choose",
          "actorLabel": "覺醒孤獨少女",
          "actorRoleIds": [
            "awakened_lonely_girl"
          ],
          "actionType": "awakened_lonely_girl_choose",
          "openPrompt": "覺醒孤獨少女請睜眼",
          "actionPrompt": "請選擇你的偶像",
          "closePrompt": "覺醒孤獨少女請閉眼"
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "step_1",
          "actorLabel": "覺醒孤獨少女",
          "actorRoleIds": [
            "awakened_lonely_girl"
          ],
          "actionType": "confirm_only",
          "openPrompt": "覺醒孤獨少女請睜眼",
          "actionPrompt": "繼承手勢為...，你繼承的身分是...",
          "closePrompt": "覺醒孤獨少女請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-awakened-lonely-girl-qa-1",
        "question": "覺醒孤獨少女崇拜到好人算是平民還是神職？",
        "answer": "兩者都不是，覺醒孤獨少女是第三方陣營，崇拜到好人算勝利條件與好人陣營相同。",
        "relatedRoleIds": [
          "awakened_lonely_girl",
          "villager"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "10p-cursed-fox",
    "name": "10 人局 - 咒狐",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "咒狐",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "cursed_fox",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "step_1",
          "actorLabel": "咒狐",
          "actorRoleIds": [
            "cursed_fox"
          ],
          "actionType": "confirm_only",
          "openPrompt": "咒狐請睜眼",
          "actionPrompt": "(確認咒狐是誰)",
          "closePrompt": "咒狐請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "10p-board-x6xglu",
    "name": "10 人局 - 千年之戀",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "千年之戀",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "蝕日侍女",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "流光伯爵",
      "白蛇預言家",
      "許仙尋香魅影"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 1
        },
        {
          "roleId": "eclipse_maid",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "radiant_earl",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "white_snake_seer",
          "count": 1
        },
        {
          "roleId": "xu_xian_phantom",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "xu_xian_action",
          "actorLabel": "許仙尋香魅影",
          "actorRoleIds": [
            "xu_xian_phantom"
          ],
          "actionType": "xu_xian_action",
          "openPrompt": "許仙尋香魅影請睜眼",
          "actionPrompt": "請選擇要綁定的兩名玩家",
          "closePrompt": "許仙尋香魅影請閉眼"
        },
        {
          "stepId": "white_snake_action",
          "actorLabel": "白蛇預言家",
          "actorRoleIds": [
            "white_snake_seer"
          ],
          "actionType": "white_snake_action",
          "openPrompt": "白蛇預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他是否為許仙尋香魅影",
          "closePrompt": "白蛇預言家請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "eclipse_maid"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "eclipse_maid_devour",
          "actorLabel": "蝕日侍女",
          "actorRoleIds": [
            "eclipse_maid"
          ],
          "actionType": "eclipse_maid_devour",
          "openPrompt": "蝕日侍女請睜眼",
          "actionPrompt": "你的狼隊友為...",
          "closePrompt": "蝕日侍女請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_7",
          "actorLabel": "流光伯爵",
          "actorRoleIds": [
            "radiant_earl"
          ],
          "actionType": "confirm_only",
          "openPrompt": "流光伯爵請睜眼",
          "actionPrompt": "(確認流光伯爵是誰)",
          "closePrompt": "流光伯爵請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "eclipse_maid_devour",
          "actorLabel": "蝕日侍女",
          "actorRoleIds": [
            "eclipse_maid"
          ],
          "actionType": "eclipse_maid_devour",
          "openPrompt": "蝕日侍女請睜眼",
          "actionPrompt": "請選擇要吞噬的目標，\n你偷到的技能為...，請問你要使用嗎？",
          "closePrompt": "蝕日侍女請閉眼"
        },
        {
          "stepId": "xu_xian_action",
          "actorLabel": "許仙尋香魅影",
          "actorRoleIds": [
            "xu_xian_phantom"
          ],
          "actionType": "xu_xian_action",
          "openPrompt": "許仙尋香魅影請睜眼",
          "actionPrompt": "請選擇要綁定的兩名玩家\n今晚的靈襲手勢為...請選擇要擊殺的目標",
          "closePrompt": "許仙尋香魅影請閉眼"
        },
        {
          "stepId": "white_snake_action",
          "actorLabel": "白蛇預言家",
          "actorRoleIds": [
            "white_snake_seer"
          ],
          "actionType": "white_snake_action",
          "openPrompt": "白蛇預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他是否為許仙尋香魅影\n今晚的靈襲手勢為...請選擇要擊殺的目標",
          "closePrompt": "白蛇預言家請閉眼"
        },
        {
          "stepId": "radiant_earl_shield",
          "actorLabel": "流光伯爵",
          "actorRoleIds": [
            "radiant_earl"
          ],
          "actionType": "radiant_earl_shield",
          "openPrompt": "流光伯爵請睜眼",
          "actionPrompt": "請選擇要庇護的玩家",
          "closePrompt": "流光伯爵請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "eclipse_maid"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "10p-board-x6xglu-qa-1",
        "question": "如果蝕日侍女吞噬被庇護的預言家，蝕日侍女是否吞噬到查驗？",
        "answer": "有，但是白天蝕日侍女就會死亡。",
        "relatedRoleIds": [
          "eclipse_maid",
          "seer"
        ]
      },
      {
        "id": "10p-board-x6xglu-qa-2",
        "question": "如果蝕日侍女吞噬流光伯爵，蝕日侍女是否吞噬到庇護？",
        "answer": "有，可以庇護自己以外的任何一人，但是白天蝕日侍女就會死亡。",
        "relatedRoleIds": [
          "eclipse_maid",
          "radiant_earl"
        ]
      },
      {
        "id": "10p-board-x6xglu-qa-3",
        "question": "蝕日侍女偷白蛇預言家的查驗並驗出許仙尋香魅影，是否會解鎖白蛇預言家的靈襲？",
        "answer": "不會，必須是白蛇預言家本人親自查驗到許仙尋香魅影才能解鎖。",
        "relatedRoleIds": [
          "xu_xian_phantom",
          "white_snake_seer",
          "eclipse_maid",
          "seer"
        ]
      },
      {
        "id": "10p-board-x6xglu-qa-4",
        "question": "蝕日侍女能偷靈襲技能嗎？",
        "answer": "不能，靈襲不是技能。",
        "relatedRoleIds": [
          "eclipse_maid"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "10p-zombie",
    "name": "10 人局 - 殭屍",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "殭屍",
      "10人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "魔術師"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "magician",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "zombie",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "zombie_infect",
          "actorLabel": "殭屍",
          "actorRoleIds": [
            "zombie"
          ],
          "actionType": "zombie_infect",
          "openPrompt": "殭屍請睜眼",
          "actionPrompt": "請選擇要感染的玩家",
          "closePrompt": "殭屍請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "所有感染者",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "所有感染者請睜眼",
          "actionPrompt": "(確認目前感染者有誰)",
          "closePrompt": "所有感染者請閉眼",
          "judgeTips": [
            "(法官走若干圈告知新感染者有誰)"
          ]
        },
        {
          "stepId": "magician_swap",
          "actorLabel": "魔術師",
          "actorRoleIds": [
            "magician"
          ],
          "actionType": "magician_swap",
          "openPrompt": "魔術師請睜眼",
          "actionPrompt": "請選擇要交換的號碼",
          "closePrompt": "魔術師請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "zombie_infect",
          "actorLabel": "殭屍",
          "actorRoleIds": [
            "zombie"
          ],
          "actionType": "zombie_infect",
          "openPrompt": "殭屍請睜眼",
          "actionPrompt": "請選擇要感染的玩家",
          "closePrompt": "殭屍請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "所有感染者",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "所有感染者請睜眼",
          "actionPrompt": "(確認目前感染者有誰)",
          "closePrompt": "所有感染者請閉眼",
          "judgeTips": [
            "(法官走若干圈告知新感染者有誰)"
          ]
        },
        {
          "stepId": "magician_swap",
          "actorLabel": "魔術師",
          "actorRoleIds": [
            "magician"
          ],
          "actionType": "magician_swap",
          "openPrompt": "魔術師請睜眼",
          "actionPrompt": "請選擇要交換的號碼",
          "closePrompt": "魔術師請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "multi-avenger-shadow",
    "name": "11 ~ 16 人局 - 影子 & 復仇者",
    "playerCount": 12,
    "playerCountRange": [
      11,
      16
    ],
    "playerCountFilter": "multi",
    "keywords": [
      "11 ~ 16 人局 - 影子",
      "復仇者",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "白痴",
      "愚者",
      "守衛",
      "影子",
      "混血兒",
      "暗戀者",
      "孤獨少女"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "shadow",
          "count": 1
        },
        {
          "roleId": "avenger",
          "count": 1
        },
        {
          "roleId": "hybrid",
          "count": 1
        }
      ]
    },
    "isFlexibleComposition": true,
    "compositionNote": "支援 11 ~ 16 人彈性開局（預設以 12 人配置列出，可於座位頁面調整人數與身分）。",
    "presetPlayerCounts": [
      11,
      12,
      13,
      14,
      15,
      16
    ],
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "hybrid_choose",
          "actorLabel": "混血兒",
          "actorRoleIds": [
            "hybrid"
          ],
          "actionType": "hybrid_choose",
          "openPrompt": "混血兒請睜眼",
          "actionPrompt": "請選擇你要混的玩家",
          "closePrompt": "混血兒請閉眼"
        },
        {
          "stepId": "shadow_choose",
          "actorLabel": "影子",
          "actorRoleIds": [
            "shadow"
          ],
          "actionType": "shadow_choose",
          "openPrompt": "影子請睜眼",
          "actionPrompt": "請選擇你的主人",
          "closePrompt": "影子請閉眼"
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_8",
          "actorLabel": "白痴",
          "actorRoleIds": [
            "idiot"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白痴請睜眼",
          "actionPrompt": "(確認白痴是誰)",
          "closePrompt": "白痴請閉眼"
        },
        {
          "stepId": "step_9",
          "actorLabel": "復仇者",
          "actorRoleIds": [
            "avenger"
          ],
          "actionType": "confirm_only",
          "openPrompt": "復仇者請睜眼",
          "actionPrompt": "你的陣營為...",
          "closePrompt": "復仇者請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "step_1",
          "actorLabel": "影子",
          "actorRoleIds": [
            "shadow"
          ],
          "actionType": "confirm_only",
          "openPrompt": "影子請睜眼",
          "actionPrompt": "你繼承的身分為...\n帶刀手勢為...請選擇要擊殺的目標",
          "closePrompt": "影子請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "idiotNeedsExtraKill",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "12p-classic",
    "name": "12 人局 - 經典",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "經典",
      "預女獵白",
      "白痴",
      "愚者",
      "12人"
    ],
    "automationLevel": "full",
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 4
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        }
      ]
    },
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "狼隊可選擇空刀或自刀；若有白天自爆狼人，於本步驟點刀後正式死亡。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "解藥與毒藥不可在同一晚同時使用；女巫能否自救請依本局規則開關判定。"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼",
          "judgeTips": [
            "僅告知所屬陣營（好人 / 狼人），不告知具體神職。"
          ]
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼",
          "judgeTips": [
            "被狼刀或放逐可開槍；若今晚被女巫毒殺則比出不可開槍手勢。"
          ]
        },
        {
          "stepId": "idiot_confirm",
          "actorLabel": "白痴",
          "actorRoleIds": [
            "idiot"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白痴請睜眼",
          "actionPrompt": "(確認白痴是誰)",
          "closePrompt": "白痴請閉眼",
          "judgeTips": [
            "僅首夜確認白痴座位，第二晚起無須睜眼。"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "狼隊可選擇空刀或自刀；若有白天自爆狼人，於本步驟點刀後正式死亡。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "解藥與毒藥不可在同一晚同時使用；女巫能否自救請依本局規則開關判定。"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼",
          "judgeTips": [
            "僅告知所屬陣營（好人 / 狼人），不告知具體神職。"
          ]
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼",
          "judgeTips": [
            "被狼刀或放逐可開槍；若今晚被女巫毒殺則比出不可開槍手勢。"
          ]
        }
      ]
    },
    "qaList": [
      {
        "id": "classic-qa-1",
        "question": "被女巫毒殺的獵人可以開槍嗎？",
        "answer": "不能開槍。獵人僅在被狼人刀出局或白天被放逐出局時才能開槍。",
        "relatedRoleIds": [
          "hunter",
          "witch"
        ]
      },
      {
        "id": "classic-qa-2",
        "question": "白痴白天被放逐翻牌免死後，狼人還需要追刀白痴才能屠神嗎？",
        "answer": "依本局「白痴追刀」開關決定：預設不用追刀（其餘神職全滅即判屠神）；若開啟追刀則白痴仍算存活神職。",
        "relatedRoleIds": [
          "idiot"
        ]
      },
      {
        "id": "classic-qa-3",
        "question": "女巫同一晚可以同時使用解藥和毒藥嗎？",
        "answer": "不行，解藥與毒藥不可在同一晚使用。",
        "relatedRoleIds": [
          "witch"
        ]
      },
      {
        "id": "classic-qa-4",
        "question": "狼人白天自爆後什麼時候正式死亡？",
        "answer": "狼人白天自爆會強制進入夜晚，並在當晚完成點刀後才正式死亡。",
        "relatedRoleIds": [
          "wolf"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "idiotNeedsExtraKill",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-wolf-king-guard",
    "name": "12 人局 - 狼王守衛",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "狼王守衛",
      "黑狼王",
      "狼王",
      "守衛",
      "預女獵守",
      "奶穿",
      "12人"
    ],
    "automationLevel": "full",
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼",
          "judgeTips": [
            "不可連續兩晚守護同一名玩家；可空守或自守；守衛僅防狼刀不防毒。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人(狼王)",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "小狼與狼王共同睜眼點刀，可空刀或自刀。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "同守同救將觸發「奶穿」導致目標死亡。",
            "解藥與毒藥不可同一晚使用；毒殺狼王或獵人可使其無法開槍。"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼",
          "judgeTips": [
            "被狼刀、奶穿、狼王開槍或放逐皆可開槍；被女巫毒殺不可開槍。"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼",
          "judgeTips": [
            "不可連續兩晚守護同一名玩家；可空守或自守；守衛僅防狼刀不防毒。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人(狼王)",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "小狼與狼王共同睜眼點刀，可空刀或自刀。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "同守同救將觸發「奶穿」導致目標死亡。",
            "解藥與毒藥不可同一晚使用；毒殺狼王或獵人可使其無法開槍。"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼",
          "judgeTips": [
            "被狼刀、奶穿、狼王開槍或放逐皆可開槍；被女巫毒殺不可開槍。"
          ]
        }
      ]
    },
    "qaList": [
      {
        "id": "wkg-qa-1",
        "question": "什麼是「同守同救奶穿」？",
        "answer": "若夜間狼人刀殺某位玩家，且守衛守護與女巫解藥同時作用於同一名玩家，會導致該玩家死亡。",
        "relatedRoleIds": [
          "guard",
          "witch"
        ]
      },
      {
        "id": "wkg-qa-2",
        "question": "守衛可以擋住女巫的毒藥嗎？",
        "answer": "不行，普通守衛的盾只能防狼刀，無法擋住女巫毒藥。",
        "relatedRoleIds": [
          "guard",
          "witch"
        ]
      },
      {
        "id": "wkg-qa-3",
        "question": "狼王在哪些情況下可以開槍？哪些情況不能？",
        "answer": "自刀死亡、被獵人開槍、被奶穿或白天被放逐出局時可開槍；但若被女巫毒殺、白天自爆或作為最後一隻狼出局則無法開槍。",
        "relatedRoleIds": [
          "wolf_king",
          "hunter",
          "witch"
        ]
      },
      {
        "id": "wkg-qa-4",
        "question": "什麼是「狼刀在先」？",
        "answer": "若當晚狼刀已達成屠民或屠神條件，即使同晚女巫毒殺最後一隻狼，仍判定狼人陣營勝利。",
        "relatedRoleIds": [
          "wolf",
          "wolf_king",
          "witch"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-wolf-king",
    "name": "12 人局 - 狼王攝夢",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "狼王攝夢",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "攝夢人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-wolf-king-qa-1",
        "question": "如果女巫救了夢遊者會被奶穿嗎？",
        "answer": "不會。",
        "relatedRoleIds": [
          "witch"
        ]
      },
      {
        "id": "12p-wolf-king-qa-2",
        "question": "如果獵人和狼王被攝夢雙攝或連帶出局能開槍嗎？",
        "answer": "不能。",
        "relatedRoleIds": [
          "hunter",
          "wolf_king"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-wolf-king-knight",
    "name": "12 人局 - 狼王騎士",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "狼王騎士",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "守衛",
      "騎士"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "knight",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-wolf-king-knight-qa-1",
        "question": "騎士能與自己決鬥嗎？",
        "answer": "不行。",
        "relatedRoleIds": [
          "knight"
        ]
      },
      {
        "id": "12p-wolf-king-knight-qa-2",
        "question": "騎士能在上警階段發起決鬥嗎？",
        "answer": "不能。",
        "relatedRoleIds": [
          "knight"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-wolf-king-magician",
    "name": "12 人局 - 狼王魔術師",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "狼王魔術師",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "魔術師"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "magician",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "magician_swap",
          "actorLabel": "魔術師",
          "actorRoleIds": [
            "magician"
          ],
          "actionType": "magician_swap",
          "openPrompt": "魔術師請睜眼",
          "actionPrompt": "請選擇要交換的號碼",
          "closePrompt": "魔術師請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "magician_swap",
          "actorLabel": "魔術師",
          "actorRoleIds": [
            "magician"
          ],
          "actionType": "magician_swap",
          "openPrompt": "魔術師請睜眼",
          "actionPrompt": "請選擇要交換的號碼",
          "closePrompt": "魔術師請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-wolf-king-guard-white-wolf-king",
    "name": "12 人局 - 白狼王守衛",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "白狼王守衛",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "白狼王",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "white_wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "white_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "white_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-wolf-king-white-wolf-king-knight",
    "name": "12 人局 - 白狼王騎士",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "白狼王騎士",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "白狼王",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "守衛",
      "騎士"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "white_wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "knight",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "white_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "white_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-wolf-king-white-wolf-king-knight-qa-1",
        "question": "騎士能與自己決鬥嗎？",
        "answer": "不行。",
        "relatedRoleIds": [
          "knight"
        ]
      },
      {
        "id": "12p-wolf-king-white-wolf-king-knight-qa-2",
        "question": "騎士能在上警階段發起決鬥嗎？",
        "answer": "不能。",
        "relatedRoleIds": [
          "knight"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-wolf-beauty-knight",
    "name": "12 人局 - 狼美人騎士",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "狼美人騎士",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼美人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "守衛",
      "騎士"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_beauty",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "knight",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-wolf-beauty-knight-qa-1",
        "question": "騎士能與自己決鬥嗎？",
        "answer": "不行。",
        "relatedRoleIds": [
          "knight"
        ]
      },
      {
        "id": "12p-wolf-beauty-knight-qa-2",
        "question": "騎士能在上警階段發起決鬥嗎？",
        "answer": "不能。",
        "relatedRoleIds": [
          "knight"
        ]
      },
      {
        "id": "12p-wolf-beauty-knight-qa-3",
        "question": "如果狼美人作為最後一狼出局，此時他魅惑的人是否出局？",
        "answer": "會，並會先判斷是否達成屠邊條件。",
        "relatedRoleIds": [
          "wolf_beauty"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-wolf-beauty",
    "name": "12 人局 - 狼美人獵騎",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "狼美人獵騎",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼美人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "騎士"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_beauty",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "knight",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-wolf-beauty-qa-1",
        "question": "騎士能與自己決鬥嗎？",
        "answer": "不行。",
        "relatedRoleIds": [
          "knight"
        ]
      },
      {
        "id": "12p-wolf-beauty-qa-2",
        "question": "騎士能在上警階段發起決鬥嗎？",
        "answer": "不能。",
        "relatedRoleIds": [
          "knight"
        ]
      },
      {
        "id": "12p-wolf-beauty-qa-3",
        "question": "如果狼美人作為最後一狼出局，此時他魅惑的人是否出局？",
        "answer": "會，並會先判斷是否達成屠邊條件。",
        "relatedRoleIds": [
          "wolf_beauty"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-wolf-beauty-2",
    "name": "12 人局 - 狼美人獵守",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "狼美人獵守",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼美人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_beauty",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-wolf-beauty-2-qa-1",
        "question": "如果狼美人作為最後一狼出局，此時他魅惑的人是否出局？",
        "answer": "會，並會先判斷是否達成屠邊條件。",
        "relatedRoleIds": [
          "wolf_beauty"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-wolf-beauty-old-rascal",
    "name": "12 人局 - 狼美人老流氓",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "狼美人老流氓",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼美人",
      "平民",
      "村民",
      "老流氓",
      "預言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_beauty",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "old_rascal",
          "count": 1
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_7",
          "actorLabel": "老流氓",
          "actorRoleIds": [
            "old_rascal"
          ],
          "actionType": "confirm_only",
          "openPrompt": "老流氓請睜眼",
          "actionPrompt": "(確認老流氓是誰)",
          "closePrompt": "老流氓請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-wolf-beauty-old-rascal-qa-1",
        "question": "如果狼美人作為最後一狼出局，此時他魅惑的人是否出局？",
        "answer": "會，並會先判斷是否達成屠邊條件。",
        "relatedRoleIds": [
          "wolf_beauty"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-evil-knight-knight",
    "name": "12 人局 - 惡靈騎士",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "惡靈騎士",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "evil_knight",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "evil_knight"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "evil_knight"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-evil-knight-knight-qa-1",
        "question": "守衛守護惡靈騎士會死亡嗎？",
        "answer": "不會。",
        "relatedRoleIds": [
          "evil_knight",
          "guard"
        ]
      },
      {
        "id": "12p-evil-knight-knight-qa-2",
        "question": "惡靈騎士會被奶穿嗎？",
        "answer": "不會，惡靈騎士無法自刀，所以不會被女巫救。",
        "relatedRoleIds": [
          "evil_knight",
          "witch"
        ]
      },
      {
        "id": "12p-evil-knight-knight-qa-3",
        "question": "守衛守護的對象被惡靈反傷會死嗎？",
        "answer": "會，守衛只防狼刀。",
        "relatedRoleIds": [
          "guard"
        ]
      },
      {
        "id": "12p-evil-knight-knight-qa-4",
        "question": "獵人白天被放逐出局，開槍能帶走惡靈騎士嗎？",
        "answer": "可以，白天開的槍不屬於夜間傷害。",
        "relatedRoleIds": [
          "evil_knight",
          "hunter"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1ak9dbq",
    "name": "12 人局 - 快言快語",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "快言快語",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "白狼王",
      "惡靈騎士",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛",
      "白痴",
      "愚者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 1
        },
        {
          "roleId": "wolf_king",
          "count": 1
        },
        {
          "roleId": "white_wolf_king",
          "count": 1
        },
        {
          "roleId": "evil_knight",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king",
            "white_wolf_king",
            "evil_knight"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "白痴",
          "actorRoleIds": [
            "idiot"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白痴請睜眼",
          "actionPrompt": "(確認白痴是誰)",
          "closePrompt": "白痴請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king",
            "white_wolf_king",
            "evil_knight"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-board-1ak9dbq-qa-1",
        "question": "守衛守護惡靈騎士會死亡嗎？",
        "answer": "不會。",
        "relatedRoleIds": [
          "evil_knight",
          "guard"
        ]
      },
      {
        "id": "12p-board-1ak9dbq-qa-2",
        "question": "惡靈騎士會被奶穿嗎？",
        "answer": "不會，惡靈騎士無法自刀，所以不會被女巫救。",
        "relatedRoleIds": [
          "evil_knight",
          "witch"
        ]
      },
      {
        "id": "12p-board-1ak9dbq-qa-3",
        "question": "守衛守護的對象被惡靈反傷會死嗎？",
        "answer": "會，守衛只防狼刀。",
        "relatedRoleIds": [
          "guard"
        ]
      },
      {
        "id": "12p-board-1ak9dbq-qa-4",
        "question": "獵人白天被放逐出局，開槍能帶走惡靈騎士嗎？",
        "answer": "可以，白天開的槍不屬於夜間傷害。",
        "relatedRoleIds": [
          "evil_knight",
          "hunter"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "idiotNeedsExtraKill",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-gargoyle-gravekeeper",
    "name": "12 人局 - 石像鬼守墓人",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "石像鬼守墓人",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "石像鬼",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守墓人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "gargoyle",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "gravekeeper",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "守墓人",
          "actorRoleIds": [
            "gravekeeper"
          ],
          "actionType": "confirm_only",
          "openPrompt": "守墓人請睜眼",
          "actionPrompt": "(確認守墓人是誰)",
          "closePrompt": "守墓人請閉眼"
        },
        {
          "stepId": "gargoyle_check",
          "actorLabel": "石像鬼",
          "actorRoleIds": [
            "gargoyle"
          ],
          "actionType": "gargoyle_check",
          "openPrompt": "石像鬼請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "石像鬼請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "gargoyle_team_status",
          "actorLabel": "石像鬼",
          "actorRoleIds": [
            "gargoyle"
          ],
          "actionType": "gargoyle_team_status",
          "openPrompt": "石像鬼請睜眼",
          "actionPrompt": "今晚的入隊手勢為...",
          "closePrompt": "石像鬼請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "gravekeeper_check",
          "actorLabel": "守墓人",
          "actorRoleIds": [
            "gravekeeper"
          ],
          "actionType": "gravekeeper_check",
          "openPrompt": "守墓人請睜眼",
          "actionPrompt": "昨天被放逐玩家的身分是...",
          "closePrompt": "守墓人請閉眼"
        },
        {
          "stepId": "gargoyle_check",
          "actorLabel": "石像鬼",
          "actorRoleIds": [
            "gargoyle"
          ],
          "actionType": "gargoyle_check",
          "openPrompt": "石像鬼請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "石像鬼請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-gargoyle-gravekeeper-qa-1",
        "question": "預言家查驗石像鬼結果為何？",
        "answer": "查殺。",
        "relatedRoleIds": [
          "seer",
          "gargoyle"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1fid5th",
    "name": "12 人局 - 血月獵魔",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "血月獵魔",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "血月使徒",
      "赤月使徒",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵魔人",
      "白痴",
      "愚者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "blood_moon_apostle",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "demon_hunter",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "blood_moon_apostle"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "獵魔人",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "confirm_only",
          "openPrompt": "獵魔人請睜眼",
          "actionPrompt": "(確認獵魔人是誰)",
          "closePrompt": "獵魔人請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "白痴",
          "actorRoleIds": [
            "idiot"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白痴請睜眼",
          "actionPrompt": "(確認白痴是誰)",
          "closePrompt": "白痴請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "blood_moon_apostle"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "demon_hunter_hunt",
          "actorLabel": "獵魔人",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "demon_hunter_hunt",
          "openPrompt": "獵魔人請睜眼",
          "actionPrompt": "請選擇要狩獵的目標",
          "closePrompt": "獵魔人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-board-1fid5th-qa-1",
        "question": "獵魔人選擇狩獵血月使徒，獵魔人會死嗎？",
        "answer": "不會，血月使徒不會反傷，所以結果為血月使徒死亡。",
        "relatedRoleIds": [
          "blood_moon_apostle",
          "demon_hunter"
        ]
      },
      {
        "id": "12p-board-1fid5th-qa-2",
        "question": "血月使徒自爆，天亮獵人死亡能開槍嗎？",
        "answer": "這板子沒有獵人。",
        "relatedRoleIds": [
          "blood_moon_apostle"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "idiotNeedsExtraKill",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-assassin-wolf",
    "name": "12 人局 - 刺客獵魔",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "刺客獵魔",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "刺客",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵魔人",
      "白痴",
      "愚者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "assassin_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "demon_hunter",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "assassin_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "獵魔人",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "confirm_only",
          "openPrompt": "獵魔人請睜眼",
          "actionPrompt": "(確認獵魔人是誰)",
          "closePrompt": "獵魔人請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "白痴",
          "actorRoleIds": [
            "idiot"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白痴請睜眼",
          "actionPrompt": "(確認白痴是誰)",
          "closePrompt": "白痴請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "assassin_wolf_assassinate",
          "actorLabel": "刺客",
          "actorRoleIds": [
            "assassin_wolf"
          ],
          "actionType": "assassin_wolf_assassinate",
          "openPrompt": "刺客請睜眼",
          "actionPrompt": "今晚的入隊手勢為...\n請選擇要刺殺的目標，請猜測他的身分",
          "closePrompt": "刺客請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "assassin_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "demon_hunter_hunt",
          "actorLabel": "獵魔人",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "demon_hunter_hunt",
          "openPrompt": "獵魔人請睜眼",
          "actionPrompt": "請選擇要狩獵的目標",
          "closePrompt": "獵魔人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "idiotNeedsExtraKill",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-war-wolf",
    "name": "12 人局 - 戰狼獵魔",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "戰狼獵魔",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "戰狼",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵魔人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "wolf_king",
          "count": 1
        },
        {
          "roleId": "war_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "demon_hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king",
            "war_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "獵魔人",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "confirm_only",
          "openPrompt": "獵魔人請睜眼",
          "actionPrompt": "(確認獵魔人是誰)",
          "closePrompt": "獵魔人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king",
            "war_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "demon_hunter_hunt",
          "actorLabel": "獵魔人",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "demon_hunter_hunt",
          "openPrompt": "獵魔人請睜眼",
          "actionPrompt": "請選擇要狩獵的目標",
          "closePrompt": "獵魔人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-war-wolf-qa-1",
        "question": "獵魔人狩獵到好人，守衛守護獵魔人會如何？",
        "answer": "獵魔人仍然會出局。",
        "relatedRoleIds": [
          "demon_hunter",
          "guard"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-nightmare",
    "name": "12 人局 - 夢魘攝夢",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "夢魘攝夢",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "夢魘",
      "噩夢之影",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "攝夢人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "nightmare",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "nightmare_fear",
          "actorLabel": "夢魘",
          "actorRoleIds": [
            "nightmare"
          ],
          "actionType": "nightmare_fear",
          "openPrompt": "夢魘請睜眼",
          "actionPrompt": "請選擇要恐懼的玩家",
          "closePrompt": "夢魘請閉眼"
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "nightmare"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "nightmare_fear",
          "actorLabel": "夢魘",
          "actorRoleIds": [
            "nightmare"
          ],
          "actionType": "nightmare_fear",
          "openPrompt": "夢魘請睜眼",
          "actionPrompt": "請選擇要恐懼的玩家",
          "closePrompt": "夢魘請閉眼"
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "nightmare"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-nightmare-qa-1",
        "question": "如果女巫救了夢遊者會被奶穿嗎？",
        "answer": "不會。",
        "relatedRoleIds": [
          "witch"
        ]
      },
      {
        "id": "12p-nightmare-qa-2",
        "question": "如果攝夢人第一天和第三天攝夢同一個對象，第二晚被恐懼，夢遊者會出局嗎？",
        "answer": "不會，要連續兩晚對同一個人攝夢才會死亡。",
        "relatedRoleIds": [
          "dream_catcher"
        ]
      },
      {
        "id": "12p-nightmare-qa-3",
        "question": "夢魘晚上恐懼獵人，白天獵人被放逐能開槍嗎？",
        "answer": "可以開槍。",
        "relatedRoleIds": [
          "hunter",
          "nightmare"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-guard-nightmare",
    "name": "12 人局 - 夢魘守衛",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "夢魘守衛",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "夢魘",
      "噩夢之影",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "nightmare",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "nightmare_fear",
          "actorLabel": "夢魘",
          "actorRoleIds": [
            "nightmare"
          ],
          "actionType": "nightmare_fear",
          "openPrompt": "夢魘請睜眼",
          "actionPrompt": "請選擇要恐懼的玩家",
          "closePrompt": "夢魘請閉眼"
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "nightmare"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "nightmare_fear",
          "actorLabel": "夢魘",
          "actorRoleIds": [
            "nightmare"
          ],
          "actionType": "nightmare_fear",
          "openPrompt": "夢魘請睜眼",
          "actionPrompt": "請選擇要恐懼的玩家",
          "closePrompt": "夢魘請閉眼"
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "nightmare"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-nightmare-2",
    "name": "12 人局 - 夢魘惑心",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "夢魘惑心",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "夢魘",
      "噩夢之影",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "蠱惑師",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "nightmare",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "enchanter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "nightmare_fear",
          "actorLabel": "夢魘",
          "actorRoleIds": [
            "nightmare"
          ],
          "actionType": "nightmare_fear",
          "openPrompt": "夢魘請睜眼",
          "actionPrompt": "請選擇要恐懼的玩家",
          "closePrompt": "夢魘請閉眼"
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "enchanter_bewitch",
          "actorLabel": "蠱惑師",
          "actorRoleIds": [
            "enchanter"
          ],
          "actionType": "enchanter_bewitch",
          "openPrompt": "蠱惑師請睜眼",
          "actionPrompt": "請選擇要蠱惑的玩家",
          "closePrompt": "蠱惑師請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "nightmare"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "nightmare_fear",
          "actorLabel": "夢魘",
          "actorRoleIds": [
            "nightmare"
          ],
          "actionType": "nightmare_fear",
          "openPrompt": "夢魘請睜眼",
          "actionPrompt": "請選擇要恐懼的玩家",
          "closePrompt": "夢魘請閉眼"
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "enchanter_bewitch",
          "actorLabel": "蠱惑師",
          "actorRoleIds": [
            "enchanter"
          ],
          "actionType": "enchanter_bewitch",
          "openPrompt": "蠱惑師請睜眼",
          "actionPrompt": "請選擇要蠱惑的玩家",
          "closePrompt": "蠱惑師請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "nightmare"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-mech-wolf-psychic",
    "name": "12 人局 - 機械狼通靈師 / 鏡隱迷蹤",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "機械狼通靈師",
      "鏡隱迷蹤",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "機械狼",
      "覺醒隱狼",
      "平民",
      "村民",
      "通靈師",
      "魔鏡少女",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "mech_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "psychic",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "mech_wolf_learn",
          "actorLabel": "機械狼",
          "actorRoleIds": [
            "mech_wolf"
          ],
          "actionType": "mech_wolf_learn",
          "openPrompt": "機械狼請睜眼",
          "actionPrompt": "請選擇要學習的對象",
          "closePrompt": "機械狼請閉眼"
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "psychic_check",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "psychic_check",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "通靈師請閉眼"
        },
        {
          "stepId": "mech_wolf_reveal_skill",
          "actorLabel": "機械狼",
          "actorRoleIds": [
            "mech_wolf"
          ],
          "actionType": "mech_wolf_reveal_skill",
          "openPrompt": "機械狼請睜眼",
          "actionPrompt": "你學習到的技能為...",
          "closePrompt": "機械狼請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "mech_wolf_night_action",
          "actorLabel": "機械狼",
          "actorRoleIds": [
            "mech_wolf"
          ],
          "actionType": "mech_wolf_night_action",
          "openPrompt": "機械狼請睜眼",
          "actionPrompt": "今晚的入隊手勢為...\n請問你要使用技能嗎？",
          "closePrompt": "機械狼請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "psychic_check",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "psychic_check",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "通靈師請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-mech-wolf-psychic-qa-1",
        "question": "機械獵晚上開的槍守衛盾的了嗎？",
        "answer": "不行，守衛的盾只擋狼刀。",
        "relatedRoleIds": [
          "guard"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "mechWolfForceLearnNight1",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-guard-wolf-brother",
    "name": "12 人局 - 狼兄弟守衛",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "狼兄弟守衛",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼兄",
      "狼弟",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "wolf_brother",
          "count": 1
        },
        {
          "roleId": "wolf_younger_brother",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "狼兄、狼弟",
          "actorRoleIds": [
            "wolf_brother",
            "wolf_younger_brother"
          ],
          "actionType": "confirm_only",
          "openPrompt": "狼兄、狼弟請睜眼",
          "actionPrompt": "狼兄、狼弟請相認",
          "closePrompt": "狼兄、狼弟請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_brother"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect_1",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_younger_brother_kill_2",
          "actorLabel": "狼弟",
          "actorRoleIds": [
            "wolf_younger_brother"
          ],
          "actionType": "wolf_younger_brother_kill",
          "openPrompt": "狼弟請睜眼",
          "actionPrompt": "今晚的復仇刀手勢是...請選擇擊殺的目標",
          "closePrompt": "狼弟請閉眼"
        },
        {
          "stepId": "wolf_kill_3",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_brother"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action_4",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check_5",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture_6",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "wolf_younger_brother_kill_cond_7",
          "actorLabel": "狼弟",
          "actorRoleIds": [
            "wolf_younger_brother"
          ],
          "actionType": "wolf_younger_brother_kill",
          "openPrompt": "狼弟請睜眼",
          "actionPrompt": "今晚的復仇刀手勢是...請選擇擊殺的目標\n今晚的入隊手勢是...",
          "closePrompt": "狼弟請閉眼",
          "judgeTips": [
            "條件分支步驟（第三晚之後）"
          ]
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-guard-wolf-brother-qa-1",
        "question": "若狼兄出局的下一個晚上僅剩狼弟存活，那當晚狼弟會提前入狼隊嗎？",
        "answer": "不會，所以狼隊就無法有雙刀。",
        "relatedRoleIds": [
          "wolf_brother",
          "wolf_younger_brother"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-wolf-brother",
    "name": "12 人局 - 狼兄弟黑市",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "狼兄弟黑市",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼兄",
      "狼弟",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "守衛",
      "黑市商人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "wolf_brother",
          "count": 1
        },
        {
          "roleId": "wolf_younger_brother",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "black_market_merchant",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "狼兄、狼弟",
          "actorRoleIds": [
            "wolf_brother",
            "wolf_younger_brother"
          ],
          "actionType": "confirm_only",
          "openPrompt": "狼兄、狼弟請睜眼",
          "actionPrompt": "狼兄、狼弟請相認",
          "closePrompt": "狼兄、狼弟請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_brother"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "black_market_gift",
          "actorLabel": "黑市商人",
          "actorRoleIds": [
            "black_market_merchant"
          ],
          "actionType": "black_market_gift",
          "openPrompt": "黑市商人請睜眼",
          "actionPrompt": "你選擇幸運兒和要給的禮物",
          "closePrompt": "黑市商人請閉眼"
        },
        {
          "stepId": "lucky_item_action",
          "actorLabel": "幸運兒",
          "actorRoleIds": [],
          "actionType": "lucky_item_action",
          "openPrompt": "幸運兒請睜眼",
          "actionPrompt": "你獲得的技能是...",
          "closePrompt": "幸運兒請閉眼",
          "judgeTips": [
            "(法官走若干圈告知幸運兒是誰)"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect_1",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_younger_brother_kill_2",
          "actorLabel": "狼弟",
          "actorRoleIds": [
            "wolf_younger_brother"
          ],
          "actionType": "wolf_younger_brother_kill",
          "openPrompt": "狼弟請睜眼",
          "actionPrompt": "今晚的復仇刀手勢是...請選擇擊殺的目標",
          "closePrompt": "狼弟請閉眼"
        },
        {
          "stepId": "wolf_kill_3",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_brother"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action_4",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check_5",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "lucky_item_action_6",
          "actorLabel": "幸運兒",
          "actorRoleIds": [],
          "actionType": "lucky_item_action",
          "openPrompt": "幸運兒請睜眼",
          "actionPrompt": "請問你是否要使用技能",
          "closePrompt": "幸運兒請閉眼"
        },
        {
          "stepId": "wolf_younger_brother_kill_cond_7",
          "actorLabel": "狼弟",
          "actorRoleIds": [
            "wolf_younger_brother"
          ],
          "actionType": "wolf_younger_brother_kill",
          "openPrompt": "狼弟請睜眼",
          "actionPrompt": "今晚的復仇刀手勢是...請選擇擊殺的目標\n今晚的入隊手勢是...",
          "closePrompt": "狼弟請閉眼",
          "judgeTips": [
            "條件分支步驟（第三晚之後）"
          ]
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-wolf-brother-qa-1",
        "question": "幸運兒的盾會「奶穿」嗎？",
        "answer": "黑市商人不會給幸運兒守衛的盾。",
        "relatedRoleIds": [
          "black_market_merchant",
          "guard"
        ]
      },
      {
        "id": "12p-wolf-brother-qa-2",
        "question": "若狼兄出局的下一個晚上僅剩狼弟存活，那當晚狼弟會提前入狼隊嗎？",
        "answer": "不會，所以狼隊就無法有雙刀。",
        "relatedRoleIds": [
          "wolf_brother",
          "wolf_younger_brother"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-wolf-king-awakened-wolf-king",
    "name": "12 人局 - 覺醒狼王奇商",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "覺醒狼王奇商",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "覺醒狼王",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "攝夢人",
      "奇蹟商人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "awakened_wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        },
        {
          "roleId": "miracle_merchant",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "awakened_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "awakened_wolf_king_give_gun",
          "actorLabel": "覺醒狼王",
          "actorRoleIds": [
            "awakened_wolf_king"
          ],
          "actionType": "awakened_wolf_king_give_gun",
          "openPrompt": "覺醒狼王請睜眼",
          "actionPrompt": "請選擇要分槍的對象",
          "closePrompt": "覺醒狼王請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "小狼",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "小狼請睜眼",
          "actionPrompt": "他被分到了槍",
          "closePrompt": "小狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "miracle_merchant_gift",
          "actorLabel": "奇蹟商人",
          "actorRoleIds": [
            "miracle_merchant"
          ],
          "actionType": "miracle_merchant_gift",
          "openPrompt": "奇蹟商人請睜眼",
          "actionPrompt": "你選擇幸運兒和要給的禮物",
          "closePrompt": "奇蹟商人請閉眼"
        },
        {
          "stepId": "lucky_item_action",
          "actorLabel": "幸運兒",
          "actorRoleIds": [],
          "actionType": "lucky_item_action",
          "openPrompt": "幸運兒請睜眼",
          "actionPrompt": "你獲得的技能是...，請問你是否要使用技能",
          "closePrompt": "幸運兒請閉眼",
          "judgeTips": [
            "(法官走若干圈告知幸運兒是誰)"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "awakened_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "awakened_wolf_king_give_gun",
          "actorLabel": "覺醒狼王",
          "actorRoleIds": [
            "awakened_wolf_king"
          ],
          "actionType": "awakened_wolf_king_give_gun",
          "openPrompt": "覺醒狼王請睜眼",
          "actionPrompt": "請選擇要分槍的對象",
          "closePrompt": "覺醒狼王請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "小狼",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "小狼請睜眼",
          "actionPrompt": "他被分到了槍",
          "closePrompt": "小狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "lucky_item_action",
          "actorLabel": "幸運兒",
          "actorRoleIds": [],
          "actionType": "lucky_item_action",
          "openPrompt": "幸運兒請睜眼",
          "actionPrompt": "請問你是否要使用技能",
          "closePrompt": "幸運兒請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-wolf-king-awakened-wolf-king-qa-1",
        "question": "幸運兒的盾會「奶穿」嗎？",
        "answer": "會，如果女巫還沒有用掉解藥的話有機會。",
        "relatedRoleIds": [
          "witch"
        ]
      },
      {
        "id": "12p-wolf-king-awakened-wolf-king-qa-2",
        "question": "覺醒狼王帶著兩把槍時被放逐能開兩次槍嗎？",
        "answer": "可以。",
        "relatedRoleIds": [
          "awakened_wolf_king"
        ]
      },
      {
        "id": "12p-wolf-king-awakened-wolf-king-qa-3",
        "question": "小狼能帶著兩把槍嗎？",
        "answer": "可以，但覺醒狼王需要要花兩個晚上分槍給他。",
        "relatedRoleIds": [
          "awakened_wolf_king",
          "wolf"
        ]
      },
      {
        "id": "12p-wolf-king-awakened-wolf-king-qa-4",
        "question": "帶著槍的小狼自爆能帶人嗎？",
        "answer": "不行，自爆不能開槍。",
        "relatedRoleIds": [
          "wolf"
        ]
      },
      {
        "id": "12p-wolf-king-awakened-wolf-king-qa-5",
        "question": "如果女巫救了夢遊者會被奶穿嗎？",
        "answer": "不會。",
        "relatedRoleIds": [
          "witch"
        ]
      },
      {
        "id": "12p-wolf-king-awakened-wolf-king-qa-6",
        "question": "如果攝夢人第一天和第三天攝夢同一個對象，第二晚被恐懼，夢遊者會出局嗎？",
        "answer": "不會，要連續兩晚對同一個人攝夢才會死亡。",
        "relatedRoleIds": [
          "dream_catcher"
        ]
      },
      {
        "id": "12p-wolf-king-awakened-wolf-king-qa-7",
        "question": "如果有槍的狼人被攝夢雙攝或連帶出局能開槍嗎？",
        "answer": "不能。",
        "relatedRoleIds": [
          "wolf"
        ]
      },
      {
        "id": "12p-wolf-king-awakened-wolf-king-qa-8",
        "question": "如果攝夢人攝夢奇蹟商人且奇蹟商人選擇狼人作為幸運兒，奇蹟商人是否會出局？",
        "answer": "不會，奇蹟商人不會出局，且本場沒有幸運兒。",
        "relatedRoleIds": [
          "miracle_merchant",
          "dream_catcher",
          "wolf"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-hidden-wolf-crow",
    "name": "12 人局 - 烏鴉隱狼",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "烏鴉隱狼",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "隱狼",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "烏鴉"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "hidden_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "crow",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "隱狼",
          "actorRoleIds": [
            "hidden_wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "隱狼請睜眼",
          "actionPrompt": "你的狼隊友為...",
          "closePrompt": "隱狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "crow_curse",
          "actorLabel": "烏鴉",
          "actorRoleIds": [
            "crow"
          ],
          "actionType": "crow_curse",
          "openPrompt": "烏鴉請睜眼",
          "actionPrompt": "請選擇要詛咒的玩家",
          "closePrompt": "烏鴉請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "step_1",
          "actorLabel": "隱狼",
          "actorRoleIds": [
            "hidden_wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "隱狼請睜眼",
          "actionPrompt": "今晚的入隊手勢為...",
          "closePrompt": "隱狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "crow_curse",
          "actorLabel": "烏鴉",
          "actorRoleIds": [
            "crow"
          ],
          "actionType": "crow_curse",
          "openPrompt": "烏鴉請睜眼",
          "actionPrompt": "請選擇要詛咒的玩家",
          "closePrompt": "烏鴉請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-hidden-wolf-bear",
    "name": "12 人局 - 熊隱狼",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "熊隱狼",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "隱狼",
      "平民",
      "村民",
      "熊",
      "馴熊師",
      "女巫",
      "獵人",
      "白痴",
      "愚者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "hidden_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "bear",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "隱狼",
          "actorRoleIds": [
            "hidden_wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "隱狼請睜眼",
          "actionPrompt": "你的狼隊友為...",
          "closePrompt": "隱狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "熊",
          "actorRoleIds": [
            "bear"
          ],
          "actionType": "confirm_only",
          "openPrompt": "熊請睜眼",
          "actionPrompt": "(確認熊是誰)",
          "closePrompt": "熊請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "白痴",
          "actorRoleIds": [
            "idiot"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白痴請睜眼",
          "actionPrompt": "(確認白痴是誰)",
          "closePrompt": "白痴請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "step_1",
          "actorLabel": "隱狼",
          "actorRoleIds": [
            "hidden_wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "隱狼請睜眼",
          "actionPrompt": "今晚的入隊手勢為...",
          "closePrompt": "隱狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "idiotNeedsExtraKill",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1a55af5",
    "name": "12 人局 - 尋香識命",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "尋香識命",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "尋香魅影",
      "平民",
      "村民",
      "覺醒預言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "scent_phantom",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "awakened_seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "scent_phantom_link",
          "actorLabel": "尋香魅影",
          "actorRoleIds": [
            "scent_phantom"
          ],
          "actionType": "scent_phantom_link",
          "openPrompt": "尋香魅影請睜眼",
          "actionPrompt": "你其中的一位狼隊友為...\n請選擇要綁定的兩位玩家",
          "closePrompt": "尋香魅影請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "awakened_seer_check",
          "actorLabel": "覺醒預言家",
          "actorRoleIds": [
            "awakened_seer"
          ],
          "actionType": "awakened_seer_check",
          "openPrompt": "覺醒預言家請睜眼",
          "actionPrompt": "請選擇要查驗的兩位玩家，他們的結果是...",
          "closePrompt": "覺醒預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "scent_phantom_link",
          "actorLabel": "尋香魅影",
          "actorRoleIds": [
            "scent_phantom"
          ],
          "actionType": "scent_phantom_link",
          "openPrompt": "尋香魅影請睜眼",
          "actionPrompt": "今晚的入隊手勢為...\n請選擇要綁定的兩位玩家",
          "closePrompt": "尋香魅影請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "awakened_seer_check",
          "actorLabel": "覺醒預言家",
          "actorRoleIds": [
            "awakened_seer"
          ],
          "actionType": "awakened_seer_check",
          "openPrompt": "覺醒預言家請睜眼",
          "actionPrompt": "請選擇要查驗的兩位玩家，他們的結果是...",
          "closePrompt": "覺醒預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1b7f950",
    "name": "12 人局 - 暗夜星辰",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "暗夜星辰",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "覺醒狼美人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "覺醒獵人",
      "白痴",
      "愚者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "awakened_wolf_beauty",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "awakened_hunter",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "step_1",
          "actorLabel": "守衛",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "awakened_wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "awakened_wolf_beauty_charm",
          "actorLabel": "覺醒狼美人",
          "actorRoleIds": [
            "awakened_wolf_beauty"
          ],
          "actionType": "awakened_wolf_beauty_charm",
          "openPrompt": "覺醒狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "覺醒狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "覺醒獵人",
          "actorRoleIds": [
            "awakened_hunter"
          ],
          "actionType": "confirm_only",
          "openPrompt": "覺醒獵人請睜眼",
          "actionPrompt": "(確認覺醒獵人是誰)",
          "closePrompt": "覺醒獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "step_1",
          "actorLabel": "守衛",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "awakened_wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "awakened_wolf_beauty_charm",
          "actorLabel": "覺醒狼美人",
          "actorRoleIds": [
            "awakened_wolf_beauty"
          ],
          "actionType": "awakened_wolf_beauty_charm",
          "openPrompt": "覺醒狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "覺醒狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "idiotNeedsExtraKill",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-wolf-king-chameleon-wolf-king",
    "name": "12 人局 - 百變狼王",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "百變狼王",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "熊",
      "馴熊師",
      "女巫",
      "獵人",
      "攝夢人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "chameleon_wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "bear",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        }
      ]
    },
    "isFlexibleComposition": true,
    "compositionNote": "含選用／替代角色（百變狼王）。",
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "百變狼王手勢為...\n請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "chameleon_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "百變狼王手勢為...\n昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "百變狼王手勢為...\n請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "熊",
          "actorRoleIds": [
            "bear"
          ],
          "actionType": "confirm_only",
          "openPrompt": "熊請睜眼",
          "actionPrompt": "百變狼王手勢為...\n請選擇要魅惑的玩家",
          "closePrompt": "熊請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "百變狼王手勢為...\n今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "chameleon_wolf_choose",
          "actorLabel": "百變狼王",
          "actorRoleIds": [
            "chameleon_wolf_king"
          ],
          "actionType": "chameleon_wolf_choose",
          "openPrompt": "百變狼王請睜眼",
          "actionPrompt": "今晚的入隊手勢為...",
          "closePrompt": "百變狼王請閉眼"
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "chameleon_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "熊",
          "actorRoleIds": [
            "bear"
          ],
          "actionType": "confirm_only",
          "openPrompt": "熊請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "熊請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-wolf-king-chameleon-wolf-king-qa-1",
        "question": "法官念到「請選擇要魅惑的玩家」代表熊是百變狼王嗎？",
        "answer": "不一定，也可能只是單純走個流程。",
        "relatedRoleIds": [
          "chameleon_wolf_king",
          "bear"
        ]
      },
      {
        "id": "12p-wolf-king-chameleon-wolf-king-qa-2",
        "question": "如果女巫救了夢遊者會被奶穿嗎？",
        "answer": "不會。",
        "relatedRoleIds": [
          "witch"
        ]
      },
      {
        "id": "12p-wolf-king-chameleon-wolf-king-qa-3",
        "question": "如果攝夢人第一天和第三天攝夢同一個對象，第二晚被恐懼，夢遊者會出局嗎？",
        "answer": "不會，要連續兩晚對同一個人攝夢才會死亡。",
        "relatedRoleIds": [
          "dream_catcher"
        ]
      },
      {
        "id": "12p-wolf-king-chameleon-wolf-king-qa-4",
        "question": "如果獵人被攝夢雙攝或連帶出局能開槍嗎？",
        "answer": "不能。",
        "relatedRoleIds": [
          "hunter"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1fwxong",
    "name": "12 人局 - 詭術之境",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "詭術之境",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "詭術師",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "魔術師",
      "定序王子"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "trickster_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "magician",
          "count": 1
        },
        {
          "roleId": "sequence_prince",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "magician_swap",
          "actorLabel": "魔術師",
          "actorRoleIds": [
            "magician"
          ],
          "actionType": "magician_swap",
          "openPrompt": "魔術師請睜眼",
          "actionPrompt": "請選擇要交換的號碼",
          "closePrompt": "魔術師請閉眼"
        },
        {
          "stepId": "trickster_wolf_swap",
          "actorLabel": "詭術師",
          "actorRoleIds": [
            "trickster_wolf"
          ],
          "actionType": "trickster_wolf_swap",
          "openPrompt": "詭術師請睜眼",
          "actionPrompt": "請選擇要交換的號碼",
          "closePrompt": "詭術師請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "trickster_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "定序王子",
          "actorRoleIds": [
            "sequence_prince"
          ],
          "actionType": "confirm_only",
          "openPrompt": "定序王子請睜眼",
          "actionPrompt": "(確認定序王子是誰)",
          "closePrompt": "定序王子請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "magician_swap",
          "actorLabel": "魔術師",
          "actorRoleIds": [
            "magician"
          ],
          "actionType": "magician_swap",
          "openPrompt": "魔術師請睜眼",
          "actionPrompt": "請選擇要交換的號碼",
          "closePrompt": "魔術師請閉眼"
        },
        {
          "stepId": "trickster_wolf_swap",
          "actorLabel": "詭術師",
          "actorRoleIds": [
            "trickster_wolf"
          ],
          "actionType": "trickster_wolf_swap",
          "openPrompt": "詭術師請睜眼",
          "actionPrompt": "請選擇要交換的號碼",
          "closePrompt": "詭術師請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "trickster_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1hvme02",
    "name": "12 人局 - 魔幻對決",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "魔幻對決",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼術師",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "魔術師"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_warlock",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "magician",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "magician_swap",
          "actorLabel": "魔術師",
          "actorRoleIds": [
            "magician"
          ],
          "actionType": "magician_swap",
          "openPrompt": "魔術師請睜眼",
          "actionPrompt": "請選擇要交換的號碼",
          "closePrompt": "魔術師請閉眼"
        },
        {
          "stepId": "wolf_warlock_swap",
          "actorLabel": "狼術師",
          "actorRoleIds": [
            "wolf_warlock"
          ],
          "actionType": "wolf_warlock_swap",
          "openPrompt": "狼術師請睜眼",
          "actionPrompt": "請選擇要交換的號碼",
          "closePrompt": "狼術師請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_warlock"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "magician_swap",
          "actorLabel": "魔術師",
          "actorRoleIds": [
            "magician"
          ],
          "actionType": "magician_swap",
          "openPrompt": "魔術師請睜眼",
          "actionPrompt": "請選擇要交換的號碼",
          "closePrompt": "魔術師請閉眼"
        },
        {
          "stepId": "wolf_warlock_swap",
          "actorLabel": "狼術師",
          "actorRoleIds": [
            "wolf_warlock"
          ],
          "actionType": "wolf_warlock_swap",
          "openPrompt": "狼術師請睜眼",
          "actionPrompt": "請選擇要交換的號碼",
          "closePrompt": "狼術師請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_warlock"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1frn80a",
    "name": "12 人局 - 覺石覺攝",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "覺石覺攝",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "覺醒石像鬼",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "覺醒攝夢人",
      "守墓人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 1
        },
        {
          "roleId": "wolf_king",
          "count": 1
        },
        {
          "roleId": "awakened_gargoyle",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "awakened_dream_catcher",
          "count": 1
        },
        {
          "roleId": "gravekeeper",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "awakened_dream_catcher_dream",
          "actorLabel": "覺醒攝夢人",
          "actorRoleIds": [
            "awakened_dream_catcher"
          ],
          "actionType": "awakened_dream_catcher_dream",
          "openPrompt": "覺醒攝夢人請睜眼",
          "actionPrompt": "請選擇要夢語的玩家",
          "closePrompt": "覺醒攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "awakened_gargoyle_convert",
          "actorLabel": "覺醒石像鬼",
          "actorRoleIds": [
            "awakened_gargoyle"
          ],
          "actionType": "awakened_gargoyle_convert",
          "openPrompt": "覺醒石像鬼請睜眼",
          "actionPrompt": "請選擇轉化的玩家",
          "closePrompt": "覺醒石像鬼請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_7",
          "actorLabel": "守墓人",
          "actorRoleIds": [
            "gravekeeper"
          ],
          "actionType": "confirm_only",
          "openPrompt": "守墓人請睜眼",
          "actionPrompt": "(確認守墓人是誰)",
          "closePrompt": "守墓人請閉眼"
        },
        {
          "stepId": "awakened_dream_catcher_judge",
          "actorLabel": "覺醒攝夢人",
          "actorRoleIds": [
            "awakened_dream_catcher"
          ],
          "actionType": "awakened_dream_catcher_judge",
          "openPrompt": "覺醒攝夢人請睜眼",
          "actionPrompt": "該玩家今晚是否有行動",
          "closePrompt": "覺醒攝夢人請閉眼",
          "judgeTips": [
            "(法官走若干圈告知轉化者是誰)"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "awakened_dream_catcher_dream",
          "actorLabel": "覺醒攝夢人",
          "actorRoleIds": [
            "awakened_dream_catcher"
          ],
          "actionType": "awakened_dream_catcher_dream",
          "openPrompt": "覺醒攝夢人請睜眼",
          "actionPrompt": "請選擇要夢語的玩家",
          "closePrompt": "覺醒攝夢人請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "轉化者",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "轉化者請睜眼",
          "actionPrompt": "今晚的入隊手勢為...",
          "closePrompt": "轉化者請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "gravekeeper_check",
          "actorLabel": "守墓人",
          "actorRoleIds": [
            "gravekeeper"
          ],
          "actionType": "gravekeeper_check",
          "openPrompt": "守墓人請睜眼",
          "actionPrompt": "昨天被放逐玩家的身分是...",
          "closePrompt": "守墓人請閉眼"
        },
        {
          "stepId": "awakened_dream_catcher_judge",
          "actorLabel": "覺醒攝夢人",
          "actorRoleIds": [
            "awakened_dream_catcher"
          ],
          "actionType": "awakened_dream_catcher_judge",
          "openPrompt": "覺醒攝夢人請睜眼",
          "actionPrompt": "該玩家今晚是否有行動\n是否要讓該玩家出局",
          "closePrompt": "覺醒攝夢人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-board-1frn80a-qa-1",
        "question": "如果女巫救了夢語者會被奶穿嗎？",
        "answer": "不會。",
        "relatedRoleIds": [
          "witch"
        ]
      },
      {
        "id": "12p-board-1frn80a-qa-2",
        "question": "如果狼隊空刀，但覺醒石像鬼有轉化別人，那覺醒石像鬼有行動嗎？",
        "answer": "有行動。",
        "relatedRoleIds": [
          "awakened_gargoyle"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-witch-awakened-witch",
    "name": "12 人局 - 覺醒女巫",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "覺醒女巫",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "覺醒狼王",
      "平民",
      "村民",
      "預言家",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "awakened_wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "awakened_witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "awakened_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "awakened_wolf_king_give_gun",
          "actorLabel": "覺醒狼王",
          "actorRoleIds": [
            "awakened_wolf_king"
          ],
          "actionType": "awakened_wolf_king_give_gun",
          "openPrompt": "覺醒狼王請睜眼",
          "actionPrompt": "請選擇要分槍的對象",
          "closePrompt": "覺醒狼王請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "小狼",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "小狼請睜眼",
          "actionPrompt": "他被分到了槍",
          "closePrompt": "小狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "awakened_witch_action",
          "actorLabel": "覺醒女巫",
          "actorRoleIds": [
            "awakened_witch"
          ],
          "actionType": "awakened_witch_action",
          "openPrompt": "覺醒女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？請選擇你的協助者",
          "closePrompt": "覺醒女巫請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "協助者",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "協助者請睜眼",
          "actionPrompt": "他要被投毒了，協助者是否同意？",
          "closePrompt": "協助者請閉眼",
          "judgeTips": [
            "(法官走若干圈告知協助者是誰)",
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "awakened_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "awakened_wolf_king_give_gun",
          "actorLabel": "覺醒狼王",
          "actorRoleIds": [
            "awakened_wolf_king"
          ],
          "actionType": "awakened_wolf_king_give_gun",
          "openPrompt": "覺醒狼王請睜眼",
          "actionPrompt": "請選擇要分槍的對象",
          "closePrompt": "覺醒狼王請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "小狼",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "小狼請睜眼",
          "actionPrompt": "他被分到了槍",
          "closePrompt": "小狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "awakened_witch_action",
          "actorLabel": "覺醒女巫",
          "actorRoleIds": [
            "awakened_witch"
          ],
          "actionType": "awakened_witch_action",
          "openPrompt": "覺醒女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？請選擇你的協助者",
          "closePrompt": "覺醒女巫請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "協助者",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "協助者請睜眼",
          "actionPrompt": "他要被投毒了，協助者是否同意？",
          "closePrompt": "協助者請閉眼",
          "judgeTips": [
            "(法官走若干圈告知協助者是誰)",
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-witch-awakened-witch-qa-1",
        "question": "覺醒狼王帶著兩把槍時被放逐能開兩次槍嗎？",
        "answer": "可以。",
        "relatedRoleIds": [
          "awakened_wolf_king"
        ]
      },
      {
        "id": "12p-witch-awakened-witch-qa-2",
        "question": "小狼能帶著兩把槍嗎？",
        "answer": "可以，但覺醒狼王需要要花兩個晚上分槍給他。",
        "relatedRoleIds": [
          "awakened_wolf_king",
          "wolf"
        ]
      },
      {
        "id": "12p-witch-awakened-witch-qa-3",
        "question": "帶著槍的小狼自爆能帶人嗎？",
        "answer": "不行，自爆不能開槍。",
        "relatedRoleIds": [
          "wolf"
        ]
      },
      {
        "id": "12p-witch-awakened-witch-qa-4",
        "question": "被投毒的人能當協助者嗎？",
        "answer": "理論上可以。"
      }
    ],
    "supportedRuleToggles": [
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-masked-wolf",
    "name": "12 人局 - 假面舞會",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "假面舞會",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "假面",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "白痴",
      "愚者",
      "舞者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "masked_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        },
        {
          "roleId": "dancer",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "step_1",
          "actorLabel": "舞者",
          "actorRoleIds": [
            "dancer"
          ],
          "actionType": "confirm_only",
          "openPrompt": "舞者請睜眼",
          "actionPrompt": "(確認舞者是誰)",
          "closePrompt": "舞者請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "假面",
          "actorRoleIds": [
            "masked_wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "假面請睜眼",
          "actionPrompt": "(確認假面是誰)",
          "closePrompt": "假面請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "masked_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "白痴",
          "actorRoleIds": [
            "idiot"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白痴請睜眼",
          "actionPrompt": "(確認白痴是誰)",
          "closePrompt": "白痴請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "dancer_dance",
          "actorLabel": "舞者",
          "actorRoleIds": [
            "dancer"
          ],
          "actionType": "dancer_dance",
          "openPrompt": "舞者請睜眼",
          "actionPrompt": "請選擇入舞池的三人",
          "closePrompt": "舞者請閉眼"
        },
        {
          "stepId": "masked_wolf_action",
          "actorLabel": "假面",
          "actorRoleIds": [
            "masked_wolf"
          ],
          "actionType": "masked_wolf_action",
          "openPrompt": "假面請睜眼",
          "actionPrompt": "請選擇一位玩家，他是否有入舞池\n請選擇要給予面具的玩家",
          "closePrompt": "假面請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "masked_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "idiotNeedsExtraKill",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1bxo1ms",
    "name": "12 人局 - 永序之輪",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "永序之輪",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "蝕時狼妃",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "守衛",
      "定序王子"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "time_eclipse_consort",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "sequence_prince",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "time_eclipse_consort"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "time_eclipse_lock",
          "actorLabel": "蝕時狼妃",
          "actorRoleIds": [
            "time_eclipse_consort"
          ],
          "actionType": "time_eclipse_lock",
          "openPrompt": "蝕時狼妃請睜眼",
          "actionPrompt": "請選擇要封鎖的玩家",
          "closePrompt": "蝕時狼妃請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "定序王子",
          "actorRoleIds": [
            "sequence_prince"
          ],
          "actionType": "confirm_only",
          "openPrompt": "定序王子請睜眼",
          "actionPrompt": "(確認定序王子是誰)",
          "closePrompt": "定序王子請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "time_eclipse_consort"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "time_eclipse_lock",
          "actorLabel": "蝕時狼妃",
          "actorRoleIds": [
            "time_eclipse_consort"
          ],
          "actionType": "time_eclipse_lock",
          "openPrompt": "蝕時狼妃請睜眼",
          "actionPrompt": "你的技能手勢為...請選擇要封鎖的玩家",
          "closePrompt": "蝕時狼妃請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-board-1bxo1ms-qa-1",
        "question": "守衛守護被蝕時狼妃封鎖的人會被視為自守，那下一晚還能自守嗎？",
        "answer": "可以，但是不能守護上一晚被封鎖的玩家。",
        "relatedRoleIds": [
          "time_eclipse_consort",
          "guard"
        ]
      },
      {
        "id": "12p-board-1bxo1ms-qa-2",
        "question": "若狼隊刀了蝕時狼妃夜晚封鎖的目標，而守衛女巫同守同救，會發生什麼？",
        "answer": "若該目標不是守衛，守衛的守護被反彈，視為該目標被狼刀後被女巫救，因此不會出局。若該目標是守衛，守衛的守護被狼妃反彈後依舊作用於自身，仍視為同守同救，因此被奶穿出局。",
        "relatedRoleIds": [
          "time_eclipse_consort",
          "guard",
          "witch"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1cvwref",
    "name": "12 人局 - 獵日逐光",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "獵日逐光",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "蝕日侍女",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "攝夢人",
      "流光伯爵"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "eclipse_maid",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        },
        {
          "roleId": "radiant_earl",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "eclipse_maid"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "eclipse_maid_devour",
          "actorLabel": "蝕日侍女",
          "actorRoleIds": [
            "eclipse_maid"
          ],
          "actionType": "eclipse_maid_devour",
          "openPrompt": "蝕日侍女請睜眼",
          "actionPrompt": "你的狼隊友為...",
          "closePrompt": "蝕日侍女請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "流光伯爵",
          "actorRoleIds": [
            "radiant_earl"
          ],
          "actionType": "confirm_only",
          "openPrompt": "流光伯爵請睜眼",
          "actionPrompt": "(確認流光伯爵是誰)",
          "closePrompt": "流光伯爵請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "eclipse_maid_devour",
          "actorLabel": "蝕日侍女",
          "actorRoleIds": [
            "eclipse_maid"
          ],
          "actionType": "eclipse_maid_devour",
          "openPrompt": "蝕日侍女請睜眼",
          "actionPrompt": "請選擇要吞噬的目標，\n你偷到的技能為...，請問你要使用嗎？",
          "closePrompt": "蝕日侍女請閉眼"
        },
        {
          "stepId": "radiant_earl_shield",
          "actorLabel": "流光伯爵",
          "actorRoleIds": [
            "radiant_earl"
          ],
          "actionType": "radiant_earl_shield",
          "openPrompt": "流光伯爵請睜眼",
          "actionPrompt": "今晚的技能狀態為...\n請選擇要庇護的玩家",
          "closePrompt": "流光伯爵請閉眼"
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "今晚的技能狀態為...\n請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "eclipse_maid"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "今晚的技能狀態為...\n昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "今晚的技能狀態為...\n請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-board-1cvwref-qa-1",
        "question": "如果蝕日侍女吞噬被庇護的預言家，蝕日侍女是否吞噬到查驗？",
        "answer": "有，但是白天蝕日侍女就會死亡。",
        "relatedRoleIds": [
          "eclipse_maid",
          "seer"
        ]
      },
      {
        "id": "12p-board-1cvwref-qa-2",
        "question": "如果蝕日侍女吞噬流光伯爵，蝕日侍女是否吞噬到庇護？",
        "answer": "有，可以庇護自己以外的任何一人，但是白天蝕日侍女就會死亡。",
        "relatedRoleIds": [
          "eclipse_maid",
          "radiant_earl"
        ]
      },
      {
        "id": "12p-board-1cvwref-qa-3",
        "question": "如果蝕日侍女吞噬攝夢人，並夢遊攝夢人上一晚夢遊的玩家，該玩家是否會死亡？",
        "answer": "會，因為該玩家連續兩晚被攝夢。",
        "relatedRoleIds": [
          "eclipse_maid",
          "dream_catcher"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1fv459z",
    "name": "12 人局 - 覺醒之夜",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "覺醒之夜",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "夜之貴族",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵魔人",
      "覺醒白痴",
      "覺醒愚者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "night_noble",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "demon_hunter",
          "count": 1
        },
        {
          "roleId": "awakened_idiot",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "awakened_idiot_shield",
          "actorLabel": "覺醒白痴",
          "actorRoleIds": [
            "awakened_idiot"
          ],
          "actionType": "awakened_idiot_shield",
          "openPrompt": "覺醒白痴請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "覺醒白痴請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "night_noble"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "獵魔人",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "confirm_only",
          "openPrompt": "獵魔人請睜眼",
          "actionPrompt": "(確認獵魔人是誰)",
          "closePrompt": "獵魔人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "awakened_idiot_shield",
          "actorLabel": "覺醒白痴",
          "actorRoleIds": [
            "awakened_idiot"
          ],
          "actionType": "awakened_idiot_shield",
          "openPrompt": "覺醒白痴請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "覺醒白痴請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "night_noble"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "night_noble_servant",
          "actorLabel": "夜之貴族",
          "actorRoleIds": [
            "night_noble"
          ],
          "actionType": "night_noble_servant",
          "openPrompt": "夜之貴族請睜眼",
          "actionPrompt": "請選擇要成為夜僕的玩家",
          "closePrompt": "夜之貴族請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "demon_hunter_hunt",
          "actorLabel": "獵魔人",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "demon_hunter_hunt",
          "openPrompt": "獵魔人請睜眼",
          "actionPrompt": "請選擇要狩獵的目標",
          "closePrompt": "獵魔人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1e5robw",
    "name": "12 人局 - 純白夜影",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "純白夜影",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼巫",
      "平民",
      "村民",
      "純白之女",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_witch",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "pure_white_maiden",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_witch"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "pure_white_check",
          "actorLabel": "純白之女",
          "actorRoleIds": [
            "pure_white_maiden"
          ],
          "actionType": "pure_white_check",
          "openPrompt": "純白之女請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "純白之女請閉眼"
        },
        {
          "stepId": "wolf_witch_check",
          "actorLabel": "狼巫",
          "actorRoleIds": [
            "wolf_witch"
          ],
          "actionType": "wolf_witch_check",
          "openPrompt": "狼巫請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "狼巫請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_witch"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_witch_check",
          "actorLabel": "狼巫",
          "actorRoleIds": [
            "wolf_witch"
          ],
          "actionType": "wolf_witch_check",
          "openPrompt": "狼巫請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "狼巫請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "pure_white_check",
          "actorLabel": "純白之女",
          "actorRoleIds": [
            "pure_white_maiden"
          ],
          "actionType": "pure_white_check",
          "openPrompt": "純白之女請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "純白之女請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-board-1e5robw-qa-1",
        "question": "若在同一個夜晚，純白之女查驗到的狼巫剛好是最後一狼，而狼巫也查驗到最後一神純白之女，此時的勝負為何？",
        "answer": "此狀況視為「狼刀在先」，所以狼人陣營獲勝。",
        "relatedRoleIds": [
          "pure_white_maiden",
          "wolf",
          "wolf_witch"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1b8ou05",
    "name": "12 人局 - 時波之亂",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "時波之亂",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "寂夜導師",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "守衛",
      "白晝學者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "silent_night_mentor",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "daylight_scholar",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "step_1",
          "actorLabel": "白晝學者",
          "actorRoleIds": [
            "daylight_scholar"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白晝學者請睜眼",
          "actionPrompt": "(確認白晝學者是誰)",
          "closePrompt": "白晝學者請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "寂夜導師",
          "actorRoleIds": [
            "silent_night_mentor"
          ],
          "actionType": "confirm_only",
          "openPrompt": "寂夜導師請睜眼",
          "actionPrompt": "(確認寂夜導師是誰)",
          "closePrompt": "寂夜導師請閉眼"
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "silent_night_mentor"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "daylight_scholar_action",
          "actorLabel": "白晝學者",
          "actorRoleIds": [
            "daylight_scholar"
          ],
          "actionType": "daylight_scholar_action",
          "openPrompt": "白晝學者請睜眼",
          "actionPrompt": "請問你要對誰使用增幅或削弱",
          "closePrompt": "白晝學者請閉眼"
        },
        {
          "stepId": "silent_night_mentor_action",
          "actorLabel": "寂夜導師",
          "actorRoleIds": [
            "silent_night_mentor"
          ],
          "actionType": "silent_night_mentor_action",
          "openPrompt": "寂夜導師請睜眼",
          "actionPrompt": "請問你要對誰使用增幅或削弱",
          "closePrompt": "寂夜導師請閉眼"
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "今晚的技能數量為\n請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "silent_night_mentor"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "今晚的技能數量為\n請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "今晚的技能數量為\n昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "今晚的技能數量為\n請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-board-1b8ou05-qa-1",
        "question": "女巫被增幅會多一個解藥嗎？",
        "answer": "不行，只有毒藥能多一個。",
        "relatedRoleIds": [
          "witch"
        ]
      },
      {
        "id": "12p-board-1b8ou05-qa-2",
        "question": "女巫被削弱能用解藥嗎？",
        "answer": "可以，只有毒藥無法使用。",
        "relatedRoleIds": [
          "witch"
        ]
      },
      {
        "id": "12p-board-1b8ou05-qa-3",
        "question": "守衛被增幅會下一晚是否因為不能連守而失去兩個能守護的對象？",
        "answer": "增幅帶來的額外守護無需遵守「不能連續兩晚守護同一人」的規定。",
        "relatedRoleIds": [
          "guard"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1cxwwcm",
    "name": "12 人局 - 猩紅蜂舞",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "猩紅蜂舞",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "猩紅狼王",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "守衛",
      "蜂之狂獵"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "scarlet_wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "bee_wild_hunt",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "scarlet_wolf_king_attach",
          "actorLabel": "猩紅狼王",
          "actorRoleIds": [
            "scarlet_wolf_king"
          ],
          "actionType": "scarlet_wolf_king_attach",
          "openPrompt": "猩紅狼王請睜眼",
          "actionPrompt": "請選擇要附著的玩家",
          "closePrompt": "猩紅狼王請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "scarlet_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "蜂之狂獵",
          "actorRoleIds": [
            "bee_wild_hunt"
          ],
          "actionType": "confirm_only",
          "openPrompt": "蜂之狂獵請睜眼",
          "actionPrompt": "(確認蜂之狂獵是誰)",
          "closePrompt": "蜂之狂獵請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "scarlet_wolf_king_attach",
          "actorLabel": "猩紅狼王",
          "actorRoleIds": [
            "scarlet_wolf_king"
          ],
          "actionType": "scarlet_wolf_king_attach",
          "openPrompt": "猩紅狼王請睜眼",
          "actionPrompt": "請選擇要附著的玩家\n今晚的帶刀手勢是...",
          "closePrompt": "猩紅狼王請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "scarlet_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "bee_wild_hunt_sting",
          "actorLabel": "蜂之狂獵",
          "actorRoleIds": [
            "bee_wild_hunt"
          ],
          "actionType": "bee_wild_hunt_sting",
          "openPrompt": "蜂之狂獵請睜眼",
          "actionPrompt": "請選擇要蜂刺的目標",
          "closePrompt": "蜂之狂獵請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1g1jcg",
    "name": "12 人局 - 動物園",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "動物園",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "白狼王",
      "兔兔",
      "熊",
      "馴熊師",
      "狐狸",
      "企鵝",
      "烏鴉"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "white_wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "bunny",
          "count": 4
        },
        {
          "roleId": "bear",
          "count": 1
        },
        {
          "roleId": "fox",
          "count": 1
        },
        {
          "roleId": "penguin",
          "count": 1
        },
        {
          "roleId": "crow",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "penguin_freeze",
          "actorLabel": "企鵝",
          "actorRoleIds": [
            "penguin"
          ],
          "actionType": "penguin_freeze",
          "openPrompt": "企鵝請睜眼",
          "actionPrompt": "請選擇要冰凍的玩家",
          "closePrompt": "企鵝請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "white_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "fox_check",
          "actorLabel": "狐狸",
          "actorRoleIds": [
            "fox"
          ],
          "actionType": "fox_check",
          "openPrompt": "狐狸請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他們三人中是否有狼人",
          "closePrompt": "狐狸請閉眼"
        },
        {
          "stepId": "crow_curse",
          "actorLabel": "烏鴉",
          "actorRoleIds": [
            "crow"
          ],
          "actionType": "crow_curse",
          "openPrompt": "烏鴉請睜眼",
          "actionPrompt": "請選擇要詛咒的玩家",
          "closePrompt": "烏鴉請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "熊",
          "actorRoleIds": [
            "bear"
          ],
          "actionType": "confirm_only",
          "openPrompt": "熊請睜眼",
          "actionPrompt": "(確認熊是誰)",
          "closePrompt": "熊請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "penguin_freeze",
          "actorLabel": "企鵝",
          "actorRoleIds": [
            "penguin"
          ],
          "actionType": "penguin_freeze",
          "openPrompt": "企鵝請睜眼",
          "actionPrompt": "請選擇要冰凍的玩家",
          "closePrompt": "企鵝請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "white_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "fox_check",
          "actorLabel": "狐狸",
          "actorRoleIds": [
            "fox"
          ],
          "actionType": "fox_check",
          "openPrompt": "狐狸請睜眼",
          "actionPrompt": "今晚的查驗手勢為...\n請選擇要查驗的玩家，他們三人中是否有狼人",
          "closePrompt": "狐狸請閉眼"
        },
        {
          "stepId": "crow_curse",
          "actorLabel": "烏鴉",
          "actorRoleIds": [
            "crow"
          ],
          "actionType": "crow_curse",
          "openPrompt": "烏鴉請睜眼",
          "actionPrompt": "請選擇要詛咒的玩家",
          "closePrompt": "烏鴉請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-animal-dream",
    "name": "12 人局 - 動物夢境",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "動物夢境",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼美人",
      "羊駝",
      "熊",
      "馴熊師",
      "子狐",
      "河豚",
      "白貓"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_beauty",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "alpaca",
          "count": 4
        },
        {
          "roleId": "bear",
          "count": 1
        },
        {
          "roleId": "fox_cub",
          "count": 1
        },
        {
          "roleId": "pufferfish",
          "count": 1
        },
        {
          "roleId": "white_cat",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "step_1",
          "actorLabel": "子狐",
          "actorRoleIds": [
            "fox_cub"
          ],
          "actionType": "confirm_only",
          "openPrompt": "子狐請睜眼",
          "actionPrompt": "(確認子狐是誰)",
          "closePrompt": "子狐請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_beauty"
          ],
          "actionType": "confirm_only",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "(確認狼人、狼美人分別是誰)",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "step_3",
          "actorLabel": "熊",
          "actorRoleIds": [
            "bear"
          ],
          "actionType": "confirm_only",
          "openPrompt": "熊請睜眼",
          "actionPrompt": "(確認熊是誰)",
          "closePrompt": "熊請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "河豚",
          "actorRoleIds": [
            "pufferfish"
          ],
          "actionType": "confirm_only",
          "openPrompt": "河豚請睜眼",
          "actionPrompt": "(確認河豚是誰)",
          "closePrompt": "河豚請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "白貓",
          "actorRoleIds": [
            "white_cat"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白貓請睜眼",
          "actionPrompt": "(確認白貓是誰)",
          "closePrompt": "白貓請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "fox_cub_charm",
          "actorLabel": "子狐",
          "actorRoleIds": [
            "fox_cub"
          ],
          "actionType": "fox_cub_charm",
          "openPrompt": "子狐請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "子狐請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-noisy-party",
    "name": "12 人局 - 鬧鬧派對",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "鬧鬧派對",
      "12人",
      "狼王",
      "黑狼王",
      "白狼王",
      "狼美人",
      "血月使徒",
      "赤月使徒",
      "預言家",
      "女巫",
      "獵人",
      "河豚",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf_king",
          "count": 2
        },
        {
          "roleId": "white_wolf_king",
          "count": 1
        },
        {
          "roleId": "wolf_beauty",
          "count": 1
        },
        {
          "roleId": "blood_moon_apostle",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 2
        },
        {
          "roleId": "pufferfish",
          "count": 2
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf_king",
            "white_wolf_king",
            "wolf_beauty",
            "blood_moon_apostle"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人 A",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人 A 請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人 A 請閉眼"
        },
        {
          "stepId": "hunter_gesture_2",
          "actorLabel": "獵人 B",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人 B 請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人 B 請閉眼"
        },
        {
          "stepId": "step_7",
          "actorLabel": "河豚 A",
          "actorRoleIds": [
            "pufferfish"
          ],
          "actionType": "confirm_only",
          "openPrompt": "河豚 A 請睜眼",
          "actionPrompt": "(確認河豚 A 是誰)",
          "closePrompt": "河豚 A 請閉眼"
        },
        {
          "stepId": "step_8",
          "actorLabel": "河豚 B",
          "actorRoleIds": [
            "pufferfish"
          ],
          "actionType": "confirm_only",
          "openPrompt": "河豚 B 請睜眼",
          "actionPrompt": "(確認河豚 B 是誰)",
          "closePrompt": "河豚 B 請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf_king",
            "white_wolf_king",
            "wolf_beauty",
            "blood_moon_apostle"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人 A",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人 A 請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人 A 請閉眼"
        },
        {
          "stepId": "hunter_gesture_2",
          "actorLabel": "獵人 B",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人 B 請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人 B 請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-misty-crow",
    "name": "12 人局 - 迷霧鴉影",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "迷霧鴉影",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼鴉之爪",
      "平民",
      "村民",
      "預言家",
      "煉金魔女",
      "攝夢人",
      "白痴",
      "愚者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_raven_claw",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "alchemy_witch",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "alchemy_witch_fog",
          "actorLabel": "煉金魔女",
          "actorRoleIds": [
            "alchemy_witch"
          ],
          "actionType": "alchemy_witch_fog",
          "openPrompt": "煉金魔女請睜眼",
          "actionPrompt": "是否使用未明之霧，你要對誰使用",
          "closePrompt": "煉金魔女請閉眼"
        },
        {
          "stepId": "step_3",
          "actorLabel": "狼鴉之爪",
          "actorRoleIds": [
            "wolf_raven_claw"
          ],
          "actionType": "confirm_only",
          "openPrompt": "狼鴉之爪請睜眼",
          "actionPrompt": "(確認狼鴉之爪是誰)",
          "closePrompt": "狼鴉之爪請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_raven_claw"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "狼鴉之爪是...\n擊殺限制為...，請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "白痴",
          "actorRoleIds": [
            "idiot"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白痴請睜眼",
          "actionPrompt": "(確認白痴是誰)",
          "closePrompt": "白痴請閉眼"
        },
        {
          "stepId": "alchemy_witch_snake",
          "actorLabel": "煉金魔女",
          "actorRoleIds": [
            "alchemy_witch"
          ],
          "actionType": "alchemy_witch_snake",
          "openPrompt": "煉金魔女請睜眼",
          "actionPrompt": "昨晚他被殺死了",
          "closePrompt": "煉金魔女請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼",
          "judgeTips": [
            "情境條件：煉金魔女尚未使用法老之蛇"
          ]
        },
        {
          "stepId": "alchemy_witch_fog",
          "actorLabel": "煉金魔女",
          "actorRoleIds": [
            "alchemy_witch"
          ],
          "actionType": "alchemy_witch_fog",
          "openPrompt": "煉金魔女請睜眼",
          "actionPrompt": "是否使用未明之霧，你要對誰使用",
          "closePrompt": "煉金魔女請閉眼",
          "judgeTips": [
            "情境條件：煉金魔女尚未使用法老之蛇"
          ]
        },
        {
          "stepId": "step_3",
          "actorLabel": "狼鴉之爪",
          "actorRoleIds": [
            "wolf_raven_claw"
          ],
          "actionType": "confirm_only",
          "openPrompt": "狼鴉之爪請睜眼",
          "actionPrompt": "今晚的帶刀手勢為...",
          "closePrompt": "狼鴉之爪請閉眼",
          "judgeTips": [
            "情境條件：煉金魔女尚未使用法老之蛇",
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_raven_claw"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "擊殺限制為...，請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "情境條件：煉金魔女尚未使用法老之蛇"
          ]
        },
        {
          "stepId": "wolf_raven_claw_kill",
          "actorLabel": "狼鴉之爪",
          "actorRoleIds": [
            "wolf_raven_claw"
          ],
          "actionType": "wolf_raven_claw_kill",
          "openPrompt": "狼鴉之爪請睜眼",
          "actionPrompt": "今晚的無敵刀手勢為...，請選擇擊殺的目標",
          "closePrompt": "狼鴉之爪請閉眼",
          "judgeTips": [
            "情境條件：煉金魔女尚未使用法老之蛇"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼",
          "judgeTips": [
            "情境條件：煉金魔女尚未使用法老之蛇"
          ]
        },
        {
          "stepId": "alchemy_witch_snake",
          "actorLabel": "煉金魔女",
          "actorRoleIds": [
            "alchemy_witch"
          ],
          "actionType": "alchemy_witch_snake",
          "openPrompt": "煉金魔女請睜眼",
          "actionPrompt": "昨晚他被殺死了",
          "closePrompt": "煉金魔女請閉眼",
          "judgeTips": [
            "情境條件：煉金魔女尚未使用法老之蛇"
          ]
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "idiotNeedsExtraKill",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1cnivrg",
    "name": "12 人局 - 無目之夜",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "無目之夜",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "隱狼",
      "石像鬼",
      "狼鴉之爪",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "攝夢人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 1
        },
        {
          "roleId": "hidden_wolf",
          "count": 1
        },
        {
          "roleId": "gargoyle",
          "count": 1
        },
        {
          "roleId": "wolf_raven_claw",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "狼鴉之爪",
          "actorRoleIds": [
            "wolf_raven_claw"
          ],
          "actionType": "confirm_only",
          "openPrompt": "狼鴉之爪請睜眼",
          "actionPrompt": "(確認狼鴉之爪是誰)",
          "closePrompt": "狼鴉之爪請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_raven_claw"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "狼鴉之爪是...\n請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "confirm_only",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "(確認預言家是誰)",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_7",
          "actorLabel": "石像鬼",
          "actorRoleIds": [
            "gargoyle"
          ],
          "actionType": "confirm_only",
          "openPrompt": "石像鬼請睜眼",
          "actionPrompt": "(確認石像鬼是誰)",
          "closePrompt": "石像鬼請閉眼"
        },
        {
          "stepId": "step_8",
          "actorLabel": "隱狼",
          "actorRoleIds": [
            "hidden_wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "隱狼請睜眼",
          "actionPrompt": "你的狼隊友為...(小狼是...狼鴉之爪是...石像鬼是...)",
          "closePrompt": "隱狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "gargoyle_check",
          "actorLabel": "石像鬼",
          "actorRoleIds": [
            "gargoyle"
          ],
          "actionType": "gargoyle_check",
          "openPrompt": "石像鬼請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "石像鬼請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "狼鴉之爪",
          "actorRoleIds": [
            "wolf_raven_claw"
          ],
          "actionType": "confirm_only",
          "openPrompt": "狼鴉之爪請睜眼",
          "actionPrompt": "今晚的入隊手勢為...",
          "closePrompt": "狼鴉之爪請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "gargoyle_team_status",
          "actorLabel": "石像鬼",
          "actorRoleIds": [
            "gargoyle"
          ],
          "actionType": "gargoyle_team_status",
          "openPrompt": "石像鬼請睜眼",
          "actionPrompt": "今晚的入隊手勢為...",
          "closePrompt": "石像鬼請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "隱狼",
          "actorRoleIds": [
            "hidden_wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "隱狼請睜眼",
          "actionPrompt": "今晚的入隊手勢為...",
          "closePrompt": "隱狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_raven_claw"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_raven_claw_kill",
          "actorLabel": "狼鴉之爪",
          "actorRoleIds": [
            "wolf_raven_claw"
          ],
          "actionType": "wolf_raven_claw_kill",
          "openPrompt": "狼鴉之爪請睜眼",
          "actionPrompt": "今晚的無敵刀手勢為...\n請選擇要擊殺的目標",
          "closePrompt": "狼鴉之爪請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "gargoyle_check",
          "actorLabel": "石像鬼",
          "actorRoleIds": [
            "gargoyle"
          ],
          "actionType": "gargoyle_check",
          "openPrompt": "石像鬼請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "石像鬼請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-board-1cnivrg-qa-1",
        "question": "預言家查驗石像鬼結果為何？",
        "answer": "查殺。",
        "relatedRoleIds": [
          "seer",
          "gargoyle"
        ]
      },
      {
        "id": "12p-board-1cnivrg-qa-2",
        "question": "石像鬼查驗隱狼結果為何？",
        "answer": "隱狼。",
        "relatedRoleIds": [
          "gargoyle",
          "hidden_wolf"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1cnivi6",
    "name": "12 人局 - 無目之城",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "無目之城",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "蝕日侍女",
      "狼鴉之爪",
      "寂夜導師",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵魔人",
      "流光伯爵"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 1
        },
        {
          "roleId": "eclipse_maid",
          "count": 1
        },
        {
          "roleId": "wolf_raven_claw",
          "count": 1
        },
        {
          "roleId": "silent_night_mentor",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "demon_hunter",
          "count": 1
        },
        {
          "roleId": "radiant_earl",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "step_1",
          "actorLabel": "狼鴉之爪",
          "actorRoleIds": [
            "wolf_raven_claw"
          ],
          "actionType": "confirm_only",
          "openPrompt": "狼鴉之爪請睜眼",
          "actionPrompt": "(確認狼鴉之爪是誰)",
          "closePrompt": "狼鴉之爪請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "eclipse_maid",
            "wolf_raven_claw",
            "silent_night_mentor"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "狼鴉之爪是...寂夜導師是...\n請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "step_3",
          "actorLabel": "寂夜導師",
          "actorRoleIds": [
            "silent_night_mentor"
          ],
          "actionType": "confirm_only",
          "openPrompt": "寂夜導師請睜眼",
          "actionPrompt": "(確認寂夜導師是誰)",
          "closePrompt": "寂夜導師請閉眼"
        },
        {
          "stepId": "eclipse_maid_devour",
          "actorLabel": "蝕日侍女",
          "actorRoleIds": [
            "eclipse_maid"
          ],
          "actionType": "eclipse_maid_devour",
          "openPrompt": "蝕日侍女請睜眼",
          "actionPrompt": "你的狼隊友為...(小狼為...狼鴉之爪為...寂夜導師為...)",
          "closePrompt": "蝕日侍女請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_7",
          "actorLabel": "獵魔人",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "confirm_only",
          "openPrompt": "獵魔人請睜眼",
          "actionPrompt": "(確認獵魔人是誰)",
          "closePrompt": "獵魔人請閉眼"
        },
        {
          "stepId": "step_8",
          "actorLabel": "流光伯爵",
          "actorRoleIds": [
            "radiant_earl"
          ],
          "actionType": "confirm_only",
          "openPrompt": "流光伯爵請睜眼",
          "actionPrompt": "(確認流光伯爵是誰)",
          "closePrompt": "流光伯爵請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "silent_night_mentor_action",
          "actorLabel": "寂夜導師",
          "actorRoleIds": [
            "silent_night_mentor"
          ],
          "actionType": "silent_night_mentor_action",
          "openPrompt": "寂夜導師請睜眼",
          "actionPrompt": "請問你要對誰使用增幅或削弱",
          "closePrompt": "寂夜導師請閉眼"
        },
        {
          "stepId": "eclipse_maid_devour",
          "actorLabel": "蝕日侍女",
          "actorRoleIds": [
            "eclipse_maid"
          ],
          "actionType": "eclipse_maid_devour",
          "openPrompt": "蝕日侍女請睜眼",
          "actionPrompt": "今晚的技能數量為...請選擇要擊殺的目標\n請選擇要吞噬的目標，\n你偷到的技能為...，請問你要使用嗎？",
          "closePrompt": "蝕日侍女請閉眼"
        },
        {
          "stepId": "radiant_earl_shield",
          "actorLabel": "流光伯爵",
          "actorRoleIds": [
            "radiant_earl"
          ],
          "actionType": "radiant_earl_shield",
          "openPrompt": "流光伯爵請睜眼",
          "actionPrompt": "今晚的技能數量為...\n請選擇要庇護的玩家",
          "closePrompt": "流光伯爵請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "狼鴉之爪",
          "actorRoleIds": [
            "wolf_raven_claw"
          ],
          "actionType": "confirm_only",
          "openPrompt": "狼鴉之爪請睜眼",
          "actionPrompt": "今晚的技能數量為...請選擇要擊殺的目標\n今晚的入隊手勢為...",
          "closePrompt": "狼鴉之爪請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "eclipse_maid",
            "wolf_raven_claw",
            "silent_night_mentor"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "今晚的技能數量為...\n請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_raven_claw_kill",
          "actorLabel": "狼鴉之爪",
          "actorRoleIds": [
            "wolf_raven_claw"
          ],
          "actionType": "wolf_raven_claw_kill",
          "openPrompt": "狼鴉之爪請睜眼",
          "actionPrompt": "今晚的無敵刀手勢為...\n請選擇要擊殺的目標",
          "closePrompt": "狼鴉之爪請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "今晚的技能數量為...\n昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "今晚的技能數量為...\n請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "demon_hunter_hunt",
          "actorLabel": "獵魔人",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "demon_hunter_hunt",
          "openPrompt": "獵魔人請睜眼",
          "actionPrompt": "今晚的技能數量為...\n請選擇要狩獵的目標",
          "closePrompt": "獵魔人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-board-1cnivi6-qa-1",
        "question": "蝕日侍女能吞噬被寂夜導師增幅的女巫的毒藥嗎？",
        "answer": "不行，蝕日侍女不能吞噬任何被寂夜導師增幅而多出來的技能。",
        "relatedRoleIds": [
          "eclipse_maid",
          "silent_night_mentor",
          "witch"
        ]
      },
      {
        "id": "12p-board-1cnivi6-qa-2",
        "question": "蝕日侍女能吞噬被寂夜導師削弱的女巫的毒藥嗎？",
        "answer": "可以，只要女巫還未使用過毒藥，並且使用完後女巫將不會再有毒藥，除非被寂夜導師增幅。",
        "relatedRoleIds": [
          "eclipse_maid",
          "silent_night_mentor",
          "witch"
        ]
      },
      {
        "id": "12p-board-1cnivi6-qa-3",
        "question": "寂夜導師削弱獵魔人，此時獵魔人是否仍能免疫毒藥？",
        "answer": "依然可以。",
        "relatedRoleIds": [
          "silent_night_mentor",
          "demon_hunter"
        ]
      },
      {
        "id": "12p-board-1cnivi6-qa-4",
        "question": "流光伯爵被增幅會下一晚是否因為不能連守而失去兩個能庇護的對象？",
        "answer": "增幅帶來的額外庇護無需遵守「不能連續兩晚守護同一人」的規定。",
        "relatedRoleIds": [
          "radiant_earl"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-twin-fantasy",
    "name": "12 人局 - 雙生幻想",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "雙生幻想",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "雙子",
      "預言家",
      "女巫",
      "獵人",
      "白痴",
      "愚者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 4
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 2
        },
        {
          "roleId": "twins",
          "count": 2
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "白痴",
          "actorRoleIds": [
            "idiot"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白痴請睜眼",
          "actionPrompt": "(確認白痴是誰)",
          "closePrompt": "白痴請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "雙子",
          "actorRoleIds": [
            "twins"
          ],
          "actionType": "confirm_only",
          "openPrompt": "雙子請睜眼",
          "actionPrompt": "雙子請相認",
          "closePrompt": "雙子請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill_1",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "情境條件：雙子未出局"
          ]
        },
        {
          "stepId": "witch_action_2",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "情境條件：雙子未出局"
          ]
        },
        {
          "stepId": "seer_check_3",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼",
          "judgeTips": [
            "情境條件：雙子未出局"
          ]
        },
        {
          "stepId": "hunter_gesture_4",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼",
          "judgeTips": [
            "情境條件：雙子未出局"
          ]
        },
        {
          "stepId": "twins_guard_cond_5",
          "actorLabel": "雙子",
          "actorRoleIds": [
            "twins"
          ],
          "actionType": "twins_guard",
          "openPrompt": "雙子請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "雙子請閉眼",
          "judgeTips": [
            "條件分支步驟（雙子出局下晚）"
          ]
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "idiotNeedsExtraKill",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-lantern-shadow",
    "name": "12 人局 - 燈影",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "燈影",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "平民",
      "村民",
      "燈影預言家",
      "預言家",
      "女巫",
      "守衛",
      "騎士"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "lantern_seer",
          "count": 1
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "knight",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家 A",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家 A 請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家 A 請閉眼"
        },
        {
          "stepId": "lantern_seer_check",
          "actorLabel": "預言家 B",
          "actorRoleIds": [
            "lantern_seer"
          ],
          "actionType": "lantern_seer_check",
          "openPrompt": "預言家 B 請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家 B 請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家 A",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家 A 請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家 A 請閉眼"
        },
        {
          "stepId": "lantern_seer_check",
          "actorLabel": "預言家 B",
          "actorRoleIds": [
            "lantern_seer"
          ],
          "actionType": "lantern_seer_check",
          "openPrompt": "預言家 B 請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家 B 請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-seer-drunk-seer",
    "name": "12 人局 - 酒鬼預言家",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "酒鬼預言家",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "守衛",
      "騎士"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "drunk_seer",
          "count": 1
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "knight",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家 A",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家 A 請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家 A 請閉眼"
        },
        {
          "stepId": "drunk_seer_check",
          "actorLabel": "預言家 B",
          "actorRoleIds": [
            "drunk_seer"
          ],
          "actionType": "drunk_seer_check",
          "openPrompt": "預言家 B 請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家 B 請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家 A",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家 A 請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家 A 請閉眼"
        },
        {
          "stepId": "drunk_seer_check",
          "actorLabel": "預言家 B",
          "actorRoleIds": [
            "drunk_seer"
          ],
          "actionType": "drunk_seer_check",
          "openPrompt": "預言家 B 請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家 B 請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-fool-seer",
    "name": "12 人局 - 自曝愚言家",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "自曝愚言家",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "平民",
      "村民",
      "鐵好人",
      "愚言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "iron_good",
          "count": 1
        },
        {
          "roleId": "fool_seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "fool_seer_check",
          "actorLabel": "愚言家",
          "actorRoleIds": [
            "fool_seer"
          ],
          "actionType": "fool_seer_check",
          "openPrompt": "愚言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "愚言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "fool_seer_check",
          "actorLabel": "愚言家",
          "actorRoleIds": [
            "fool_seer"
          ],
          "actionType": "fool_seer_check",
          "openPrompt": "愚言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "愚言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-fool-seer-qa-1",
        "question": "愚言家和鐵好人自曝會吞警徽嗎？",
        "answer": "會。",
        "relatedRoleIds": [
          "iron_good",
          "fool_seer"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-big-bad-wolf-little-girl",
    "name": "12 人局 - 小女孩大野狼",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "小女孩大野狼",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "大野狼",
      "平民",
      "村民",
      "小女孩",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "big_bad_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "little_girl",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人與小女孩",
          "actorRoleIds": [
            "wolf",
            "big_bad_wolf",
            "little_girl"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人與小女孩請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人與小女孩請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "big_bad_wolf_kill",
          "actorLabel": "大野狼",
          "actorRoleIds": [
            "big_bad_wolf"
          ],
          "actionType": "big_bad_wolf_kill",
          "openPrompt": "大野狼請睜眼",
          "actionPrompt": "請選擇擊殺的目標",
          "closePrompt": "大野狼請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人與小女孩",
          "actorRoleIds": [
            "wolf",
            "big_bad_wolf",
            "little_girl"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人與小女孩請睜眼",
          "actionPrompt": "請選擇要擊殺的目標\n請指認小女孩，三秒後投票，三、二、一",
          "closePrompt": "狼人與小女孩請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "big_bad_wolf_kill",
          "actorLabel": "大野狼",
          "actorRoleIds": [
            "big_bad_wolf"
          ],
          "actionType": "big_bad_wolf_kill",
          "openPrompt": "大野狼請睜眼",
          "actionPrompt": "請選擇擊殺的目標",
          "closePrompt": "大野狼請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-big-bad-wolf-little-girl-qa-1",
        "question": "小女孩指認階段，小女孩的票算數嗎？",
        "answer": "算數。",
        "relatedRoleIds": [
          "little_girl"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-seed-wolf",
    "name": "12 人局 - 種狼(飯局版)",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "種狼(飯局版)",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "種狼",
      "平民",
      "村民",
      "高級平民",
      "高級村民",
      "熊",
      "馴熊師",
      "女巫",
      "狐狸",
      "鏽劍騎士"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "seed_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "senior_villager",
          "count": 1
        },
        {
          "roleId": "bear",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "fox",
          "count": 1
        },
        {
          "roleId": "rusty_sword_knight",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "seed_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺或感染，請選擇要擊殺或感染的玩家",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "(法官走若干圈告知感染者是誰)"
          ]
        },
        {
          "stepId": "fox_check",
          "actorLabel": "狐狸",
          "actorRoleIds": [
            "fox"
          ],
          "actionType": "fox_check",
          "openPrompt": "狐狸請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他們三人中是否有狼人",
          "closePrompt": "狐狸請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "熊",
          "actorRoleIds": [
            "bear"
          ],
          "actionType": "confirm_only",
          "openPrompt": "熊請睜眼",
          "actionPrompt": "(確認熊是誰)",
          "closePrompt": "熊請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "鏽劍騎士",
          "actorRoleIds": [
            "rusty_sword_knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "鏽劍騎士請睜眼",
          "actionPrompt": "(確認鏽劍騎士是誰)",
          "closePrompt": "鏽劍騎士請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "高級平民",
          "actorRoleIds": [
            "senior_villager"
          ],
          "actionType": "confirm_only",
          "openPrompt": "高級平民請睜眼",
          "actionPrompt": "(確認高級平民是誰)",
          "closePrompt": "高級平民請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "seed_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺或感染，請選擇要擊殺或感染的玩家",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "(法官走若干圈告知感染者是誰)"
          ]
        },
        {
          "stepId": "fox_check",
          "actorLabel": "狐狸",
          "actorRoleIds": [
            "fox"
          ],
          "actionType": "fox_check",
          "openPrompt": "狐狸請睜眼",
          "actionPrompt": "今晚的查驗手勢為...\n請選擇要查驗的玩家，他們三人中是否有狼人",
          "closePrompt": "狐狸請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-seed-wolf-qa-1",
        "question": "種狼若選擇開感染技能，女巫會如何得知刀口？",
        "answer": "顯示空刀。",
        "relatedRoleIds": [
          "witch",
          "seed_wolf"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-seed-wolf-2",
    "name": "12 人局 - 種狼(京城版)",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "種狼(京城版)",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "種狼",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "守衛",
      "騎士"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "seed_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "knight",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "seed_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺或感染，請選擇要擊殺或感染的玩家",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "(法官走若干圈告知感染者是誰)"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "seed_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺或感染，請選擇要擊殺或感染的玩家",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "(法官走若干圈告知感染者是誰)"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-seed-wolf-2-qa-1",
        "question": "種狼若選擇開感染技能，女巫會如何得知刀口？",
        "answer": "顯示空刀。",
        "relatedRoleIds": [
          "witch",
          "seed_wolf"
        ]
      },
      {
        "id": "12p-seed-wolf-2-qa-2",
        "question": "如果種狼感染的玩家被守衛守護結果會如何？",
        "answer": "被守護的玩家不會被感染。",
        "relatedRoleIds": [
          "guard",
          "seed_wolf"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-seed-wolf-3",
    "name": "12 人局 - 種狼(娛百版)",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "種狼(娛百版)",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "種狼",
      "隱狼",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "seed_wolf",
          "count": 1
        },
        {
          "roleId": "hidden_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "seed_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺或感染，請選擇要擊殺或感染的玩家",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "step_3",
          "actorLabel": "隱狼",
          "actorRoleIds": [
            "hidden_wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "隱狼請睜眼",
          "actionPrompt": "你的狼隊友為...(小狼是...種狼是...)",
          "closePrompt": "隱狼請閉眼",
          "judgeTips": [
            "(法官走若干圈告知感染者是誰)",
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "隱狼",
          "actorRoleIds": [
            "hidden_wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "隱狼請睜眼",
          "actionPrompt": "今晚的入隊手勢為...",
          "closePrompt": "隱狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "seed_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺或感染，請選擇要擊殺或感染的玩家",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "(法官走若干圈告知感染者是誰)"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-seed-wolf-3-qa-1",
        "question": "種狼若選擇開感染技能，女巫會如何得知刀口？",
        "answer": "顯示空刀。",
        "relatedRoleIds": [
          "witch",
          "seed_wolf"
        ]
      },
      {
        "id": "12p-seed-wolf-3-qa-2",
        "question": "種狼若感染到隱狼，結果為何？",
        "answer": "隱狼失去原有技能，回歸狼隊，被查驗到為查殺。",
        "relatedRoleIds": [
          "seed_wolf",
          "hidden_wolf"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-seed-wolf-4",
    "name": "12 人局 - 種狼(私版)",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "種狼(私版)",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "種狼",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "seed_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "seed_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺或感染，請選擇要擊殺或感染的玩家",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "(法官走若干圈告知感染者是誰)"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "seed_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺或感染，請選擇要擊殺或感染的玩家",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "(法官走若干圈告知感染者是誰)"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-seed-wolf-4-qa-1",
        "question": "種狼若選擇開感染技能，女巫會如何得知刀口？",
        "answer": "顯示空刀。",
        "relatedRoleIds": [
          "witch",
          "seed_wolf"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-neighbor-only",
    "name": "12 人局 - 唯鄰是從",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "唯鄰是從",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "傀儡",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "wolf_king",
          "count": 1
        },
        {
          "roleId": "puppet_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 5
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "isFlexibleComposition": true,
    "compositionNote": "含選用／替代角色（傀儡）。",
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king",
            "puppet_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇一位傀儡\n請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king",
            "puppet_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-wolf-beauty-3",
    "name": "12 人局 - 狼美人惑騎",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "狼美人惑騎",
      "12人",
      "戰狼",
      "種狼",
      "狼美人",
      "平民",
      "村民",
      "高級平民",
      "高級村民",
      "熊",
      "馴熊師",
      "女巫",
      "蠱惑師",
      "騎士"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "war_wolf",
          "count": 1
        },
        {
          "roleId": "seed_wolf",
          "count": 1
        },
        {
          "roleId": "wolf_beauty",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "senior_villager",
          "count": 1
        },
        {
          "roleId": "bear",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "enchanter",
          "count": 1
        },
        {
          "roleId": "knight",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "enchanter_bewitch",
          "actorLabel": "蠱惑師",
          "actorRoleIds": [
            "enchanter"
          ],
          "actionType": "enchanter_bewitch",
          "openPrompt": "蠱惑師請睜眼",
          "actionPrompt": "請選擇要蠱惑的玩家",
          "closePrompt": "蠱惑師請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "war_wolf",
            "seed_wolf",
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺或感染，請選擇要擊殺或感染的玩家",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼",
          "judgeTips": [
            "(法官走若干圈告知感染者是誰)"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "預言家",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "step_6",
          "actorLabel": "熊",
          "actorRoleIds": [
            "bear"
          ],
          "actionType": "confirm_only",
          "openPrompt": "熊請睜眼",
          "actionPrompt": "(確認熊是誰)",
          "closePrompt": "熊請閉眼"
        },
        {
          "stepId": "step_7",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        },
        {
          "stepId": "step_8",
          "actorLabel": "高級平民",
          "actorRoleIds": [
            "senior_villager"
          ],
          "actionType": "confirm_only",
          "openPrompt": "高級平民請睜眼",
          "actionPrompt": "(確認高級平民是誰)",
          "closePrompt": "高級平民請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "enchanter_bewitch",
          "actorLabel": "蠱惑師",
          "actorRoleIds": [
            "enchanter"
          ],
          "actionType": "enchanter_bewitch",
          "openPrompt": "蠱惑師請睜眼",
          "actionPrompt": "請選擇要蠱惑的玩家",
          "closePrompt": "蠱惑師請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "war_wolf",
            "seed_wolf",
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺或感染，請選擇要擊殺或感染的玩家",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼",
          "judgeTips": [
            "(法官走若干圈告知感染者是誰)"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "預言家",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-wolf-beauty-3-qa-1",
        "question": "騎士能與自己決鬥嗎？",
        "answer": "不行。",
        "relatedRoleIds": [
          "knight"
        ]
      },
      {
        "id": "12p-wolf-beauty-3-qa-2",
        "question": "騎士能在上警階段發起決鬥嗎？",
        "answer": "不能。",
        "relatedRoleIds": [
          "knight"
        ]
      },
      {
        "id": "12p-wolf-beauty-3-qa-3",
        "question": "如果狼美人作為最後一狼出局，此時他魅惑的人是否出局？",
        "answer": "會，並會先判斷是否達成屠邊條件。",
        "relatedRoleIds": [
          "wolf_beauty"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-big-grey-wolf-fortune-teller",
    "name": "12 人局 - 大灰狼占卜師",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "大灰狼占卜師",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "大灰狼",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "占卜師"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "big_grey_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "fortune_teller",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "fortune_teller_mark",
          "actorLabel": "占卜師",
          "actorRoleIds": [
            "fortune_teller"
          ],
          "actionType": "fortune_teller_mark",
          "openPrompt": "占卜師請睜眼",
          "actionPrompt": "請問是否要發動技能，請選擇要標記的玩家",
          "closePrompt": "占卜師請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "big_grey_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "大灰狼請閉眼\n擊殺目標限制為...，請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "fortune_teller_mark",
          "actorLabel": "占卜師",
          "actorRoleIds": [
            "fortune_teller"
          ],
          "actionType": "fortune_teller_mark",
          "openPrompt": "占卜師請睜眼",
          "actionPrompt": "請問是否要發動技能，請選擇要標記的玩家",
          "closePrompt": "占卜師請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "大灰狼",
          "actorRoleIds": [
            "big_grey_wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "大灰狼請睜眼",
          "actionPrompt": "今晚的帶刀手勢為...",
          "closePrompt": "大灰狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "big_grey_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "擊殺目標限制為...，請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "big_grey_wolf_kill",
          "actorLabel": "大灰狼",
          "actorRoleIds": [
            "big_grey_wolf"
          ],
          "actionType": "big_grey_wolf_kill",
          "openPrompt": "大灰狼請睜眼",
          "actionPrompt": "請問是否要發動技能，擊殺目標限制為...，請選擇要擊殺的目標",
          "closePrompt": "大灰狼請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-nine-tails-wolf-nine-tailed-fox",
    "name": "12 人局 - 九尾狐",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "九尾狐",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 4
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "nine_tailed_fox",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "九尾狐",
          "actorRoleIds": [
            "nine_tailed_fox"
          ],
          "actionType": "confirm_only",
          "openPrompt": "九尾狐請睜眼",
          "actionPrompt": "(確認九尾狐是誰)",
          "closePrompt": "九尾狐請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "nine_tailed_fox_check",
          "actorLabel": "九尾狐",
          "actorRoleIds": [
            "nine_tailed_fox"
          ],
          "actionType": "nine_tailed_fox_check",
          "openPrompt": "九尾狐請睜眼",
          "actionPrompt": "尾巴剩餘數量為...",
          "closePrompt": "九尾狐請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-nine-tails-wolf-nine-tailed-fox-qa-1",
        "question": "九尾狐能知道當晚狼人殺的是神職還是平民嗎？",
        "answer": "不行，因為他們的死訊還沒公佈。",
        "relatedRoleIds": [
          "nine_tailed_fox",
          "wolf",
          "villager"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1gwfsm6",
    "name": "12 人局 - 針鋒相槓",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "針鋒相槓",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "槓精"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 4
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "contrarian",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "槓精",
          "actorRoleIds": [
            "contrarian"
          ],
          "actionType": "confirm_only",
          "openPrompt": "槓精請睜眼",
          "actionPrompt": "(確認槓精是誰)",
          "closePrompt": "槓精請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-socialite",
    "name": "12 人局 - 名媛",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "名媛",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "戰狼",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "混血兒",
      "暗戀者",
      "孤獨少女"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "war_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "socialite",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "hybrid",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "hybrid_choose",
          "actorLabel": "混血兒",
          "actorRoleIds": [
            "hybrid"
          ],
          "actionType": "hybrid_choose",
          "openPrompt": "混血兒請睜眼",
          "actionPrompt": "請選擇你要混的玩家",
          "closePrompt": "混血兒請閉眼"
        },
        {
          "stepId": "socialite_favor",
          "actorLabel": "名媛",
          "actorRoleIds": [
            "socialite"
          ],
          "actionType": "socialite_favor",
          "openPrompt": "名媛請睜眼",
          "actionPrompt": "請選擇要寵幸的玩家",
          "closePrompt": "名媛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "war_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "socialite_favor",
          "actorLabel": "名媛",
          "actorRoleIds": [
            "socialite"
          ],
          "actionType": "socialite_favor",
          "openPrompt": "名媛請睜眼",
          "actionPrompt": "請選擇要寵幸的玩家",
          "closePrompt": "名媛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "war_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "12p-medium",
    "name": "12 人局 - 通靈者",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "通靈者",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "戰狼",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "wolf_king",
          "count": 1
        },
        {
          "roleId": "war_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "medium",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "step_1",
          "actorLabel": "通靈者",
          "actorRoleIds": [
            "medium"
          ],
          "actionType": "confirm_only",
          "openPrompt": "通靈者請睜眼",
          "actionPrompt": "(確認通靈者是誰)",
          "closePrompt": "通靈者請閉眼"
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king",
            "war_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "medium_channel_1",
          "actorLabel": "通靈者",
          "actorRoleIds": [
            "medium"
          ],
          "actionType": "medium_channel",
          "openPrompt": "通靈者請睜眼",
          "actionPrompt": "請選擇要通靈的玩家，請選擇要繼承的玩家",
          "closePrompt": "通靈者請閉眼"
        },
        {
          "stepId": "step_2_2",
          "actorLabel": "第二晚的繼承者",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "第二晚的繼承者請睜眼",
          "actionPrompt": "你繼承到的技能為...，請問你要使用嗎？",
          "closePrompt": "第二晚的繼承者請閉眼",
          "judgeTips": [
            "(法官走若干圈告知繼承者是誰)",
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "guard_protect_3",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill_4",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king",
            "war_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action_5",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check_6",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_2_cond_7",
          "actorLabel": "第三晚的繼承者",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "第三晚的繼承者請睜眼",
          "actionPrompt": "你繼承到的技能為...，請問你要使用技能嗎？",
          "closePrompt": "第三晚的繼承者請閉眼",
          "judgeTips": [
            "條件分支步驟（第三晚）",
            "(法官走若干圈告知繼承者是誰)",
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "step_3_cond_8",
          "actorLabel": "第二晚的繼承者",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "第二晚的繼承者請睜眼",
          "actionPrompt": "請問你要使用技能嗎？",
          "closePrompt": "第二晚的繼承者請閉眼",
          "judgeTips": [
            "條件分支步驟（第三晚）",
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "wolf_kill_cond_9",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king",
            "war_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "條件分支步驟（第三晚）"
          ]
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-moon-spirit-wolf",
    "name": "12 人局 - 月靈狼",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "月靈狼",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "夢魘",
      "噩夢之影",
      "平民",
      "村民",
      "熊",
      "馴熊師",
      "女巫",
      "名媛",
      "騎士"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "moon_spirit_wolf",
          "count": 1
        },
        {
          "roleId": "nightmare",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "bear",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "socialite",
          "count": 1
        },
        {
          "roleId": "knight",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "nightmare_fear",
          "actorLabel": "夢魘",
          "actorRoleIds": [
            "nightmare"
          ],
          "actionType": "nightmare_fear",
          "openPrompt": "夢魘請睜眼",
          "actionPrompt": "請選擇要恐懼的玩家",
          "closePrompt": "夢魘請閉眼"
        },
        {
          "stepId": "socialite_favor",
          "actorLabel": "名媛",
          "actorRoleIds": [
            "socialite"
          ],
          "actionType": "socialite_favor",
          "openPrompt": "名媛請睜眼",
          "actionPrompt": "請選擇要寵幸的玩家",
          "closePrompt": "名媛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "moon_spirit_wolf",
            "nightmare"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "熊",
          "actorRoleIds": [
            "bear"
          ],
          "actionType": "confirm_only",
          "openPrompt": "熊請睜眼",
          "actionPrompt": "(確認熊是誰)",
          "closePrompt": "熊請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "騎士",
          "actorRoleIds": [
            "knight"
          ],
          "actionType": "confirm_only",
          "openPrompt": "騎士請睜眼",
          "actionPrompt": "(確認騎士是誰)",
          "closePrompt": "騎士請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "nightmare_fear",
          "actorLabel": "夢魘",
          "actorRoleIds": [
            "nightmare"
          ],
          "actionType": "nightmare_fear",
          "openPrompt": "夢魘請睜眼",
          "actionPrompt": "請選擇要恐懼的玩家",
          "closePrompt": "夢魘請閉眼"
        },
        {
          "stepId": "socialite_favor",
          "actorLabel": "名媛",
          "actorRoleIds": [
            "socialite"
          ],
          "actionType": "socialite_favor",
          "openPrompt": "名媛請睜眼",
          "actionPrompt": "請選擇要寵幸的玩家",
          "closePrompt": "名媛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "moon_spirit_wolf",
            "nightmare"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-demon-wolf",
    "name": "12 人局 - 惡魔",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "惡魔",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "demon_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "demon_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "demon_wolf_check",
          "actorLabel": "惡魔",
          "actorRoleIds": [
            "demon_wolf"
          ],
          "actionType": "demon_wolf_check",
          "openPrompt": "惡魔請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "惡魔請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "demon_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "demon_wolf_check",
          "actorLabel": "惡魔",
          "actorRoleIds": [
            "demon_wolf"
          ],
          "actionType": "demon_wolf_check",
          "openPrompt": "惡魔請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "惡魔請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-troublemaker-wolf",
    "name": "12 人局 - 搗蛋鬼",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "搗蛋鬼",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "troublemaker_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "step_1",
          "actorLabel": "搗蛋鬼",
          "actorRoleIds": [
            "troublemaker_wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "搗蛋鬼請睜眼",
          "actionPrompt": "(確認搗蛋鬼是誰)",
          "closePrompt": "搗蛋鬼請閉眼"
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "troublemaker_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "troublemaker_prank",
          "actorLabel": "搗蛋鬼",
          "actorRoleIds": [
            "troublemaker_wolf"
          ],
          "actionType": "troublemaker_prank",
          "openPrompt": "搗蛋鬼請睜眼",
          "actionPrompt": "今晚的開刀手勢為...\n請選擇要耍寶的玩家",
          "closePrompt": "搗蛋鬼請閉眼"
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "troublemaker_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-19vcnl0",
    "name": "12 人局 - 孤注一擲",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "孤注一擲",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "典獄長",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "攝夢人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "warden_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "warden_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "warden_wolf_trade",
          "actorLabel": "典獄長",
          "actorRoleIds": [
            "warden_wolf"
          ],
          "actionType": "warden_wolf_trade",
          "openPrompt": "典獄長請睜眼",
          "actionPrompt": "請選擇兩名進行交易的目標",
          "closePrompt": "典獄長請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "(法官走若干圈告知兩位交易玩家是誰)",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "(法官走若干圈告知兩位交易玩家是誰)",
          "actionPrompt": "(依規則執行夜間行動)",
          "closePrompt": "(法官走若干圈告知兩位交易玩家是誰)請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "step_3",
          "actorLabel": "交易的兩位玩家",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "交易的兩位玩家請睜眼",
          "actionPrompt": "請確認彼此",
          "closePrompt": "交易的兩位玩家請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "第一位交易玩家",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "第一位交易玩家請睜眼",
          "actionPrompt": "請選擇交易或背叛",
          "closePrompt": "第一位交易玩家請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "step_5",
          "actorLabel": "第二位交易玩家",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "第二位交易玩家請睜眼",
          "actionPrompt": "請選擇交易或背叛",
          "closePrompt": "第二位交易玩家請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "warden_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-board-19vcnl0-qa-1",
        "question": "如果女巫救了夢遊者會被奶穿嗎？",
        "answer": "不會。",
        "relatedRoleIds": [
          "witch"
        ]
      },
      {
        "id": "12p-board-19vcnl0-qa-2",
        "question": "如果攝夢人第一天和第三天攝夢同一個對象，第二晚被恐懼，夢遊者會出局嗎？",
        "answer": "不會，要連續兩晚對同一個人攝夢才會死亡。",
        "relatedRoleIds": [
          "dream_catcher"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-khufu-horizon",
    "name": "12 人局 - 胡夫地平線",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "胡夫地平線",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "阿努比斯",
      "平民",
      "村民",
      "預言家",
      "煉金魔女",
      "獵人",
      "攝夢人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "anubis",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "alchemy_witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "阿努比斯",
          "actorRoleIds": [
            "anubis"
          ],
          "actionType": "confirm_only",
          "openPrompt": "阿努比斯請睜眼",
          "actionPrompt": "(確認阿努比斯是誰)",
          "closePrompt": "阿努比斯請閉眼"
        },
        {
          "stepId": "alchemy_witch_fog",
          "actorLabel": "煉金魔女",
          "actorRoleIds": [
            "alchemy_witch"
          ],
          "actionType": "alchemy_witch_fog",
          "openPrompt": "煉金魔女請睜眼",
          "actionPrompt": "是否使用未明之霧，你要對誰使用",
          "closePrompt": "煉金魔女請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "anubis"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "擊殺限制為...，請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "alchemy_witch_snake",
          "actorLabel": "煉金魔女",
          "actorRoleIds": [
            "alchemy_witch"
          ],
          "actionType": "alchemy_witch_snake",
          "openPrompt": "煉金魔女請睜眼",
          "actionPrompt": "昨晚他被殺死了",
          "closePrompt": "煉金魔女請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼",
          "judgeTips": [
            "情境條件：煉金魔女尚未使用法老之蛇"
          ]
        },
        {
          "stepId": "anubis_scale",
          "actorLabel": "阿努比斯",
          "actorRoleIds": [
            "anubis"
          ],
          "actionType": "anubis_scale",
          "openPrompt": "阿努比斯請睜眼",
          "actionPrompt": "請選擇要置於天平的兩位玩家",
          "closePrompt": "阿努比斯請閉眼",
          "judgeTips": [
            "情境條件：煉金魔女尚未使用法老之蛇"
          ]
        },
        {
          "stepId": "alchemy_witch_fog",
          "actorLabel": "煉金魔女",
          "actorRoleIds": [
            "alchemy_witch"
          ],
          "actionType": "alchemy_witch_fog",
          "openPrompt": "煉金魔女請睜眼",
          "actionPrompt": "是否使用未明之霧，你要對誰使用",
          "closePrompt": "煉金魔女請閉眼",
          "judgeTips": [
            "情境條件：煉金魔女尚未使用法老之蛇"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "anubis"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "擊殺限制為...，請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "情境條件：煉金魔女尚未使用法老之蛇"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼",
          "judgeTips": [
            "情境條件：煉金魔女尚未使用法老之蛇"
          ]
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼",
          "judgeTips": [
            "情境條件：煉金魔女尚未使用法老之蛇"
          ]
        },
        {
          "stepId": "alchemy_witch_snake",
          "actorLabel": "煉金魔女",
          "actorRoleIds": [
            "alchemy_witch"
          ],
          "actionType": "alchemy_witch_snake",
          "openPrompt": "煉金魔女請睜眼",
          "actionPrompt": "昨晚他被殺死了",
          "closePrompt": "煉金魔女請閉眼",
          "judgeTips": [
            "情境條件：煉金魔女尚未使用法老之蛇"
          ]
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1iex5ls",
    "name": "12 人局 - 黑白使者",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "黑白使者",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "黑夜使者",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "攝夢人",
      "白夜使者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "wolf_king",
          "count": 1
        },
        {
          "roleId": "dark_night_envoy",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        },
        {
          "roleId": "white_night_envoy",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king",
            "dark_night_envoy"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "dark_night_envoy_shield",
          "actorLabel": "黑夜使者",
          "actorRoleIds": [
            "dark_night_envoy"
          ],
          "actionType": "dark_night_envoy_shield",
          "openPrompt": "黑夜使者請睜眼",
          "actionPrompt": "請選擇要庇護的玩家",
          "closePrompt": "黑夜使者請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "白夜使者",
          "actorRoleIds": [
            "white_night_envoy"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白夜使者請睜眼",
          "actionPrompt": "(確認白夜使者是誰)",
          "closePrompt": "白夜使者請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king",
            "dark_night_envoy"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "dark_night_envoy_shield",
          "actorLabel": "黑夜使者",
          "actorRoleIds": [
            "dark_night_envoy"
          ],
          "actionType": "dark_night_envoy_shield",
          "openPrompt": "黑夜使者請睜眼",
          "actionPrompt": "請選擇要庇護的玩家",
          "closePrompt": "黑夜使者請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-board-1iex5ls-qa-1",
        "question": "如果女巫救了夢遊者會被奶穿嗎？",
        "answer": "不會。",
        "relatedRoleIds": [
          "witch"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-medusa",
    "name": "12 人局 - 梅杜莎之眼",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "梅杜莎之眼",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "梅杜莎",
      "美杜莎",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "珀爾修斯",
      "柏修斯",
      "帕修斯",
      "白痴",
      "愚者"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "medusa",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "perseus",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "medusa_petrify",
          "actorLabel": "梅杜莎",
          "actorRoleIds": [
            "medusa"
          ],
          "actionType": "medusa_petrify",
          "openPrompt": "梅杜莎請睜眼",
          "actionPrompt": "請選擇要石化的玩家",
          "closePrompt": "梅杜莎請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "medusa"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "珀爾修斯",
          "actorRoleIds": [
            "perseus"
          ],
          "actionType": "confirm_only",
          "openPrompt": "珀爾修斯請睜眼",
          "actionPrompt": "(確認珀爾修斯是誰)",
          "closePrompt": "珀爾修斯請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "白痴",
          "actorRoleIds": [
            "idiot"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白痴請睜眼",
          "actionPrompt": "(確認白痴是誰)",
          "closePrompt": "白痴請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "medusa_petrify",
          "actorLabel": "梅杜莎",
          "actorRoleIds": [
            "medusa"
          ],
          "actionType": "medusa_petrify",
          "openPrompt": "梅杜莎請睜眼",
          "actionPrompt": "請選擇要石化的玩家",
          "closePrompt": "梅杜莎請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "medusa"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "perseus_execute",
          "actorLabel": "珀爾修斯",
          "actorRoleIds": [
            "perseus"
          ],
          "actionType": "perseus_execute",
          "openPrompt": "珀爾修斯請睜眼",
          "actionPrompt": "請選擇要處決的玩家",
          "closePrompt": "珀爾修斯請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "idiotNeedsExtraKill",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-black-bat",
    "name": "12 人局 - 黑蝙蝠",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "黑蝙蝠",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "black_bat",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "black_bat"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "black_bat_shield",
          "actorLabel": "黑蝙蝠",
          "actorRoleIds": [
            "black_bat"
          ],
          "actionType": "black_bat_shield",
          "openPrompt": "黑蝙蝠請睜眼",
          "actionPrompt": "請選擇要庇護的玩家",
          "closePrompt": "黑蝙蝠請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "black_bat"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "black_bat_shield",
          "actorLabel": "黑蝙蝠",
          "actorRoleIds": [
            "black_bat"
          ],
          "actionType": "black_bat_shield",
          "openPrompt": "黑蝙蝠請睜眼",
          "actionPrompt": "請選擇要庇護的玩家",
          "closePrompt": "黑蝙蝠請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-wolf-girl",
    "name": "12 人局 - 狼女孩",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "狼女孩",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "毒師",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_girl",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "poisoner",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_girl_confess",
          "actorLabel": "狼女孩",
          "actorRoleIds": [
            "wolf_girl"
          ],
          "actionType": "wolf_girl_confess",
          "openPrompt": "狼女孩請睜眼",
          "actionPrompt": "所有小狼請舉手\n請選擇表白的玩家",
          "closePrompt": "狼女孩請閉眼\n所有小狼手放下"
        },
        {
          "stepId": "step_3",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_girl"
          ],
          "actionType": "confirm_only",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "(確認狼人是誰)",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "poisoner_poison",
          "actorLabel": "毒師",
          "actorRoleIds": [
            "poisoner"
          ],
          "actionType": "poisoner_poison",
          "openPrompt": "毒師請睜眼",
          "actionPrompt": "請選擇要毒的玩家",
          "closePrompt": "毒師請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_7",
          "actorLabel": "被表白者",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "被表白者請睜眼",
          "actionPrompt": "狼女孩的號碼是...",
          "closePrompt": "被表白者請閉眼",
          "judgeTips": [
            "(法官走若干圈告知被表白者是誰)",
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_girl"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "poisoner_poison",
          "actorLabel": "毒師",
          "actorRoleIds": [
            "poisoner"
          ],
          "actionType": "poisoner_poison",
          "openPrompt": "毒師請睜眼",
          "actionPrompt": "請選擇要毒的玩家",
          "closePrompt": "毒師請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1hb0a89",
    "name": "12 人局 - 青丘夜影",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "青丘夜影",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "九尾",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "守衛",
      "白澤"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "nine_tails_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "bai_ze",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "白澤",
          "actorRoleIds": [
            "bai_ze"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白澤請睜眼",
          "actionPrompt": "(確認白澤是誰)",
          "closePrompt": "白澤請閉眼"
        },
        {
          "stepId": "nine_tails_mark",
          "actorLabel": "九尾",
          "actorRoleIds": [
            "nine_tails_wolf"
          ],
          "actionType": "nine_tails_mark",
          "openPrompt": "九尾請睜眼",
          "actionPrompt": "請選擇要標記的玩家",
          "closePrompt": "九尾請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "nine_tails_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "bai_ze_clear",
          "actorLabel": "白澤",
          "actorRoleIds": [
            "bai_ze"
          ],
          "actionType": "bai_ze_clear",
          "openPrompt": "白澤請睜眼",
          "actionPrompt": "請選擇要清除標記的玩家",
          "closePrompt": "白澤請閉眼"
        },
        {
          "stepId": "nine_tails_mark",
          "actorLabel": "九尾",
          "actorRoleIds": [
            "nine_tails_wolf"
          ],
          "actionType": "nine_tails_mark",
          "openPrompt": "九尾請睜眼",
          "actionPrompt": "請選擇要標記的玩家\n今晚的帶刀手勢是...",
          "closePrompt": "九尾請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "nine_tails_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-board-1hb0a89-qa-1",
        "question": "如果競選警長進入平票 PK，那九尾會標記兩次嗎？",
        "answer": "不會，只會標記兩次中最後一次投的玩家。(如果第二次棄票，則標記第一次投的人)",
        "relatedRoleIds": [
          "nine_tails_wolf"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-pumpkin-ghost",
    "name": "12 人局 - 南瓜鬼",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "南瓜鬼",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "石像鬼",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "超級守墓人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "gargoyle",
          "count": 1
        },
        {
          "roleId": "pumpkin_ghost",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "super_gravekeeper",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "pumpkin_ghost"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "super_gravekeeper_action",
          "actorLabel": "超級守墓人",
          "actorRoleIds": [
            "super_gravekeeper"
          ],
          "actionType": "super_gravekeeper_action",
          "openPrompt": "超級守墓人請睜眼",
          "actionPrompt": "請選擇繼承者",
          "closePrompt": "超級守墓人請閉眼"
        },
        {
          "stepId": "gargoyle_check",
          "actorLabel": "石像鬼",
          "actorRoleIds": [
            "gargoyle"
          ],
          "actionType": "gargoyle_check",
          "openPrompt": "石像鬼請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "石像鬼請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "gargoyle_team_status",
          "actorLabel": "石像鬼",
          "actorRoleIds": [
            "gargoyle"
          ],
          "actionType": "gargoyle_team_status",
          "openPrompt": "石像鬼請睜眼",
          "actionPrompt": "今晚的入隊手勢為...",
          "closePrompt": "石像鬼請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "pumpkin_ghost"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "super_gravekeeper_action",
          "actorLabel": "超級守墓人",
          "actorRoleIds": [
            "super_gravekeeper"
          ],
          "actionType": "super_gravekeeper_action",
          "openPrompt": "超級守墓人請睜眼",
          "actionPrompt": "昨天被放逐玩家的身分是...\n請選擇繼承者",
          "closePrompt": "超級守墓人請閉眼"
        },
        {
          "stepId": "super_gravekeeper_heir_check",
          "actorLabel": "繼承者",
          "actorRoleIds": [],
          "actionType": "super_gravekeeper_heir_check",
          "openPrompt": "繼承者請睜眼",
          "actionPrompt": "昨天被放逐玩家的身分是...\n超級守墓人為...，之前所有放逐玩家的紀錄為...",
          "closePrompt": "繼承者請閉眼",
          "judgeTips": [
            "(法官走若干圈告知繼承者是誰)"
          ]
        },
        {
          "stepId": "gargoyle_check",
          "actorLabel": "石像鬼",
          "actorRoleIds": [
            "gargoyle"
          ],
          "actionType": "gargoyle_check",
          "openPrompt": "石像鬼請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "石像鬼請閉眼"
        },
        {
          "stepId": "pumpkin_ghost_check",
          "actorLabel": "南瓜鬼",
          "actorRoleIds": [
            "pumpkin_ghost"
          ],
          "actionType": "pumpkin_ghost_check",
          "openPrompt": "南瓜鬼請睜眼",
          "actionPrompt": "今晚的繼承手勢為...，石像鬼的查驗紀錄為...\n請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "南瓜鬼請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-pumpkin-ghost-qa-1",
        "question": "預言家查驗石像鬼結果為何？",
        "answer": "查殺。",
        "relatedRoleIds": [
          "seer",
          "gargoyle"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-evil-merchant",
    "name": "12 人局 - 邪惡商人",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "邪惡商人",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "evil_merchant",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "evil_merchant"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "evil_merchant_gift",
          "actorLabel": "邪惡商人",
          "actorRoleIds": [
            "evil_merchant"
          ],
          "actionType": "evil_merchant_gift",
          "openPrompt": "邪惡商人請睜眼",
          "actionPrompt": "請選擇要分槍的對象",
          "closePrompt": "邪惡商人請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "小狼",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "小狼請睜眼",
          "actionPrompt": "他被分到了槍",
          "closePrompt": "小狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "evil_merchant"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "evil_merchant_gift",
          "actorLabel": "邪惡商人",
          "actorRoleIds": [
            "evil_merchant"
          ],
          "actionType": "evil_merchant_gift",
          "openPrompt": "邪惡商人請睜眼",
          "actionPrompt": "能換毒藥的手勢為...\n是否要收回獵槍？請選擇要給毒藥的對象",
          "closePrompt": "邪惡商人請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "小狼",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "小狼請睜眼",
          "actionPrompt": "獵槍被回收的手勢為...\n他被分到了毒藥",
          "closePrompt": "小狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "step_5",
          "actorLabel": "持毒的小狼",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "持毒的小狼請睜眼",
          "actionPrompt": "請選擇要毒的玩家",
          "closePrompt": "持毒的小狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-super-black-market-merchant-black-market-merchant",
    "name": "12 人局 - 超級黑市商人",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "超級黑市商人",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "super_black_market_merchant",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "super_black_market_gift",
          "actorLabel": "超級黑市商人",
          "actorRoleIds": [
            "super_black_market_merchant"
          ],
          "actionType": "super_black_market_gift",
          "openPrompt": "超級黑市商人請睜眼",
          "actionPrompt": "請依序選擇三位幸運兒",
          "closePrompt": "超級黑市商人請閉眼",
          "judgeTips": [
            "(法官走若干圈告知三位幸運兒分別是誰)"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect_1",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "super_black_market_gift_2",
          "actorLabel": "超級黑市商人",
          "actorRoleIds": [
            "super_black_market_merchant"
          ],
          "actionType": "super_black_market_gift",
          "openPrompt": "超級黑市商人請睜眼",
          "actionPrompt": "你的陣營為...\n今晚的入隊手勢為...",
          "closePrompt": "超級黑市商人請閉眼"
        },
        {
          "stepId": "wolf_kill_3",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action_4",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check_5",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "step_6_6",
          "actorLabel": "拿到查驗的幸運兒",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "拿到查驗的幸運兒請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "拿到查驗的幸運兒請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "step_7_7",
          "actorLabel": "拿到毒藥的幸運兒",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "拿到毒藥的幸運兒請睜眼",
          "actionPrompt": "請選擇要毒殺的玩家",
          "closePrompt": "拿到毒藥的幸運兒請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "step_8_8",
          "actorLabel": "拿到獵槍的幸運兒",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "拿到獵槍的幸運兒請睜眼",
          "actionPrompt": "今晚的開槍手勢為...",
          "closePrompt": "拿到獵槍的幸運兒請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "super_black_market_gift_cond_9",
          "actorLabel": "超級黑市商人",
          "actorRoleIds": [
            "super_black_market_merchant"
          ],
          "actionType": "super_black_market_gift",
          "openPrompt": "超級黑市商人請睜眼",
          "actionPrompt": "今晚的入隊手勢為...",
          "closePrompt": "超級黑市商人請閉眼",
          "judgeTips": [
            "條件分支步驟（第三晚之後）"
          ]
        },
        {
          "stepId": "wolf_kill_cond_10",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "條件分支步驟（第三晚之後）"
          ]
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-detective",
    "name": "12 人局 - 偵探怪盜",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "偵探怪盜",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "怪盜狼王",
      "平民",
      "村民",
      "偵探",
      "女巫",
      "警犬",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "phantom_wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "detective",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "police_dog",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "phantom_wolf_invincible",
          "actorLabel": "怪盜狼王",
          "actorRoleIds": [
            "phantom_wolf_king"
          ],
          "actionType": "phantom_wolf_invincible",
          "openPrompt": "怪盜狼王請睜眼",
          "actionPrompt": "請問今晚是否使用技能",
          "closePrompt": "怪盜狼王請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "phantom_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "偵探",
          "actorRoleIds": [
            "detective"
          ],
          "actionType": "confirm_only",
          "openPrompt": "偵探請睜眼",
          "actionPrompt": "(確認偵探是誰)",
          "closePrompt": "偵探請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "警犬",
          "actorRoleIds": [
            "police_dog"
          ],
          "actionType": "confirm_only",
          "openPrompt": "警犬請睜眼",
          "actionPrompt": "(確認警犬是誰)",
          "closePrompt": "警犬請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect_1",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼",
          "judgeTips": [
            "情境條件：如果偵探未使用技能"
          ]
        },
        {
          "stepId": "phantom_wolf_invincible_2",
          "actorLabel": "怪盜狼王",
          "actorRoleIds": [
            "phantom_wolf_king"
          ],
          "actionType": "phantom_wolf_invincible",
          "openPrompt": "怪盜狼王請睜眼",
          "actionPrompt": "請問今晚是否使用技能",
          "closePrompt": "怪盜狼王請閉眼",
          "judgeTips": [
            "情境條件：如果偵探未使用技能"
          ]
        },
        {
          "stepId": "wolf_kill_3",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "phantom_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "情境條件：如果偵探未使用技能"
          ]
        },
        {
          "stepId": "witch_action_4",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "情境條件：如果偵探未使用技能"
          ]
        },
        {
          "stepId": "wolf_kill_cond_5",
          "actorLabel": "狼人（如果偵探使用技能）",
          "actorRoleIds": [
            "wolf",
            "phantom_wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "條件分支步驟（第二晚 (如果偵探使用技能)）"
          ]
        },
        {
          "stepId": "police_dog_action_cond_6",
          "actorLabel": "警犬（如果偵探使用技能）",
          "actorRoleIds": [
            "police_dog"
          ],
          "actionType": "police_dog_action",
          "openPrompt": "警犬請睜眼",
          "actionPrompt": "昨晚被處決的身分為...\n請選擇你要使用技能的對象",
          "closePrompt": "警犬請閉眼",
          "judgeTips": [
            "條件分支步驟（第二晚 (如果偵探使用技能)）"
          ]
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-detective-qa-1",
        "question": "守衛守得住警犬撕咬嗎？",
        "answer": "不行，守衛只能守狼刀，不能守警犬的撕咬。",
        "relatedRoleIds": [
          "guard",
          "police_dog"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-1hlxijo",
    "name": "12 人局 - 青青草原",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "青青草原",
      "12人",
      "小小灰",
      "灰太狼",
      "羊駝",
      "預言家",
      "女巫",
      "獵人",
      "喜羊羊"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "little_grey_wolf",
          "count": 3
        },
        {
          "roleId": "grey_wolf_boss",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "alpaca",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "happy_sheep",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "happy_sheep_action",
          "actorLabel": "喜羊羊",
          "actorRoleIds": [
            "happy_sheep"
          ],
          "actionType": "happy_sheep_action",
          "openPrompt": "喜羊羊請睜眼",
          "actionPrompt": "請選擇一名玩家進行防盜或守護",
          "closePrompt": "喜羊羊請閉眼"
        },
        {
          "stepId": "grey_wolf_boss_steal",
          "actorLabel": "灰太狼",
          "actorRoleIds": [
            "grey_wolf_boss"
          ],
          "actionType": "grey_wolf_boss_steal",
          "openPrompt": "灰太狼請睜眼",
          "actionPrompt": "請選擇要偷取的玩家",
          "closePrompt": "灰太狼請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "little_grey_wolf",
            "grey_wolf_boss"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "今晚的技能狀態為...\n昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "今晚的技能狀態為...\n請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢為...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "grey_wolf_boss_steal_2",
          "actorLabel": "灰太狼",
          "actorRoleIds": [
            "grey_wolf_boss"
          ],
          "actionType": "grey_wolf_boss_steal",
          "openPrompt": "灰太狼請睜眼",
          "actionPrompt": "你偷取到的技能為...，請選擇技能發動目標",
          "closePrompt": "灰太狼請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "happy_sheep_action",
          "actorLabel": "喜羊羊",
          "actorRoleIds": [
            "happy_sheep"
          ],
          "actionType": "happy_sheep_action",
          "openPrompt": "喜羊羊請睜眼",
          "actionPrompt": "請選擇一名玩家進行防盜或守護",
          "closePrompt": "喜羊羊請閉眼"
        },
        {
          "stepId": "grey_wolf_boss_steal",
          "actorLabel": "灰太狼",
          "actorRoleIds": [
            "grey_wolf_boss"
          ],
          "actionType": "grey_wolf_boss_steal",
          "openPrompt": "灰太狼請睜眼",
          "actionPrompt": "今晚的帶刀手勢為...\n請選擇要偷取的玩家，你偷取到的技能為...",
          "closePrompt": "灰太狼請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "little_grey_wolf",
            "grey_wolf_boss"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "今晚的技能狀態為...\n請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "今晚的技能狀態為...\n昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "今晚的技能狀態為...\n請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢為...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "grey_wolf_boss_steal_2",
          "actorLabel": "灰太狼",
          "actorRoleIds": [
            "grey_wolf_boss"
          ],
          "actionType": "grey_wolf_boss_steal",
          "openPrompt": "灰太狼請睜眼",
          "actionPrompt": "請選擇技能發動目標",
          "closePrompt": "灰太狼請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-board-1hlxijo-qa-1",
        "question": "女巫撒毒偷取獵槍的灰太狼，會發生什麼？",
        "answer": "灰太狼無法開槍，且獵槍視為已消耗，即獵人永久失去獵槍，夜晚開槍手勢恆為倒讚。",
        "relatedRoleIds": [
          "grey_wolf_boss",
          "hunter",
          "witch"
        ]
      },
      {
        "id": "12p-board-1hlxijo-qa-2",
        "question": "灰太狼是否知道自己猜測正確或錯誤？",
        "answer": "如果猜測錯誤，則在天亮出局；若猜測正確，下一晚會獲得可以帶刀的手勢，並失去偷竊功能回到狼隊。",
        "relatedRoleIds": [
          "grey_wolf_boss"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-board-18851fx",
    "name": "12 人局 - 一盞榮枯",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "一盞榮枯",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼僕",
      "狼女僕",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "守衛",
      "管家"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_maid",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        },
        {
          "roleId": "butler",
          "count": 1
        }
      ]
    },
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "step_1",
          "actorLabel": "狼女僕",
          "actorRoleIds": [
            "wolf_maid"
          ],
          "actionType": "confirm_only",
          "openPrompt": "狼女僕請睜眼",
          "actionPrompt": "(確認狼女僕是誰)",
          "closePrompt": "狼女僕請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "管家",
          "actorRoleIds": [
            "butler"
          ],
          "actionType": "confirm_only",
          "openPrompt": "管家請睜眼",
          "actionPrompt": "(確認管家是誰)",
          "closePrompt": "管家請閉眼"
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_maid"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "狼女僕是...\n請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_maid_tea",
          "actorLabel": "狼僕",
          "actorRoleIds": [
            "wolf_maid"
          ],
          "actionType": "wolf_maid_tea",
          "openPrompt": "狼僕請睜眼",
          "actionPrompt": "請問你要對誰上茶",
          "closePrompt": "狼僕請閉眼"
        },
        {
          "stepId": "butler_tea",
          "actorLabel": "管家",
          "actorRoleIds": [
            "butler"
          ],
          "actionType": "butler_tea",
          "openPrompt": "管家請睜眼",
          "actionPrompt": "你是否被上茶\n請問你要對誰上茶",
          "closePrompt": "管家請閉眼"
        },
        {
          "stepId": "wolf_maid_tea_2",
          "actorLabel": "狼僕",
          "actorRoleIds": [
            "wolf_maid"
          ],
          "actionType": "wolf_maid_tea",
          "openPrompt": "狼僕請睜眼",
          "actionPrompt": "你是否被上茶",
          "closePrompt": "狼僕請閉眼"
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "你是否被上茶，請問你要接受嗎？\n請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_maid"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "你們是否被上茶，請問你們要接受嗎？\n請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "你們是否被上茶，請問你們要接受嗎？\n昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "你們是否被上茶，請問你們要接受嗎？\n請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-board-18851fx-qa-1",
        "question": "女巫被狼僕上茶能使用解藥嗎？",
        "answer": "不行。",
        "relatedRoleIds": [
          "witch",
          "wolf_maid"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-jack-the-ripper",
    "name": "12 人局 - 開膛手傑克",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "開膛手傑克",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "jack_the_ripper",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "jack_ripper_action",
          "actorLabel": "開膛手傑克",
          "actorRoleIds": [
            "jack_the_ripper"
          ],
          "actionType": "jack_ripper_action",
          "openPrompt": "開膛手傑克請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "開膛手傑克請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "jack_ripper_action",
          "actorLabel": "開膛手傑克",
          "actorRoleIds": [
            "jack_the_ripper"
          ],
          "actionType": "jack_ripper_action",
          "openPrompt": "開膛手傑克請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "開膛手傑克請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "12p-jack-the-ripper-2",
    "name": "12 人局 - 開膛手傑克 (第二身分)",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "開膛手傑克 (第二身分)",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "惡魔",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "demon_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "compositionNote": "含第二身分機制（開膛手傑克 / 狂熱粉 / 偵探），請搭配實體牌與性別提示主持。",
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "step_1",
          "actorLabel": "開膛手傑克",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "開膛手傑克請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "開膛手傑克請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "step_2",
          "actorLabel": "開膛手傑克和狂熱粉",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "開膛手傑克和狂熱粉請睜眼",
          "actionPrompt": "開膛手傑克和狂熱粉請相認",
          "closePrompt": "開膛手傑克和狂熱粉請閉眼",
          "judgeTips": [
            "(法官走若干圈告知狂熱粉是誰)"
          ]
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "demon_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "demon_wolf_check",
          "actorLabel": "惡魔",
          "actorRoleIds": [
            "demon_wolf"
          ],
          "actionType": "demon_wolf_check",
          "openPrompt": "惡魔請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "惡魔請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "demon_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "demon_wolf_check",
          "actorLabel": "惡魔",
          "actorRoleIds": [
            "demon_wolf"
          ],
          "actionType": "demon_wolf_check",
          "openPrompt": "惡魔請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "惡魔請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-sleeping-beauty",
    "name": "12 人局 - 睡美人",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "睡美人",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "異族王子",
      "熊",
      "馴熊師",
      "女巫",
      "獵人",
      "禁言長老"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 4
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "exotic_prince",
          "count": 1
        },
        {
          "roleId": "bear",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "mute_elder",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "sleeping_beauty",
          "count": 1
        }
      ]
    },
    "isFlexibleComposition": true,
    "compositionNote": "含特殊額外身分（睡美人），可依實際發牌調整。",
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "mute_elder_mute",
          "actorLabel": "禁言長老",
          "actorRoleIds": [
            "mute_elder"
          ],
          "actionType": "mute_elder_mute",
          "openPrompt": "禁言長老請睜眼",
          "actionPrompt": "請選擇要禁言的玩家",
          "closePrompt": "禁言長老請閉眼"
        },
        {
          "stepId": "step_5",
          "actorLabel": "熊",
          "actorRoleIds": [
            "bear"
          ],
          "actionType": "confirm_only",
          "openPrompt": "熊請睜眼",
          "actionPrompt": "(確認熊是誰)",
          "closePrompt": "熊請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "異族王子",
          "actorRoleIds": [
            "exotic_prince"
          ],
          "actionType": "confirm_only",
          "openPrompt": "異族王子請睜眼",
          "actionPrompt": "(確認異族王子是誰)",
          "closePrompt": "異族王子請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "exotic_prince_check",
          "actorLabel": "異族王子",
          "actorRoleIds": [
            "exotic_prince"
          ],
          "actionType": "exotic_prince_check",
          "openPrompt": "異族王子請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他是否為睡美人",
          "closePrompt": "異族王子請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "mute_elder_mute",
          "actorLabel": "禁言長老",
          "actorRoleIds": [
            "mute_elder"
          ],
          "actionType": "mute_elder_mute",
          "openPrompt": "禁言長老請睜眼",
          "actionPrompt": "請選擇要禁言的玩家",
          "closePrompt": "禁言長老請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "12p-cupid-thief",
    "name": "12 人局 - 盜賊邱比特",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "盜賊邱比特",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "白痴",
      "愚者",
      "盜賊",
      "千面人",
      "邱比特"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 5
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "thief",
          "count": 1
        },
        {
          "roleId": "cupid",
          "count": 1
        }
      ]
    },
    "isFlexibleComposition": true,
    "compositionNote": "牌池共 14 張牌（含盜賊／額外底牌），從中發出 12 張上場。",
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "thief_choose",
          "actorLabel": "盜賊",
          "actorRoleIds": [
            "thief"
          ],
          "actionType": "thief_choose",
          "openPrompt": "盜賊請睜眼",
          "actionPrompt": "請選擇一個身分",
          "closePrompt": "盜賊請閉眼"
        },
        {
          "stepId": "cupid_link",
          "actorLabel": "邱比特",
          "actorRoleIds": [
            "cupid"
          ],
          "actionType": "cupid_link",
          "openPrompt": "邱比特請睜眼",
          "actionPrompt": "請選擇情侶",
          "closePrompt": "邱比特請閉眼"
        },
        {
          "stepId": "step_3",
          "actorLabel": "情侶",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "情侶請睜眼",
          "actionPrompt": "請確認彼此",
          "closePrompt": "情侶請閉眼",
          "judgeTips": [
            "(法官走若干圈告知情侶分別是誰)"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_8",
          "actorLabel": "白痴",
          "actorRoleIds": [
            "idiot"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白痴請睜眼",
          "actionPrompt": "(確認白痴是誰)",
          "closePrompt": "白痴請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-cupid-thief-qa-1",
        "question": "會出現沒有盜賊的情況嗎？",
        "answer": "不會，盜賊必定出現。",
        "relatedRoleIds": [
          "thief"
        ]
      },
      {
        "id": "12p-cupid-thief-qa-2",
        "question": "會出現沒有情侶的情況嗎？",
        "answer": "可能，如果盜賊捨棄邱比特。",
        "relatedRoleIds": [
          "cupid",
          "thief"
        ]
      },
      {
        "id": "12p-cupid-thief-qa-3",
        "question": "邱比特如果是好人陣營算是平民還是神職？",
        "answer": "兩者都不是，邱比特是第三方陣營，勝利條件與好人陣營相同。",
        "relatedRoleIds": [
          "cupid",
          "villager"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "idiotNeedsExtraKill",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "12p-cupid",
    "name": "12 人局 - 邱比特奇緣",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "邱比特奇緣",
      "12人",
      "狼王",
      "黑狼王",
      "夢魘",
      "噩夢之影",
      "狼巫",
      "蝕時狼妃",
      "預言家",
      "女巫",
      "獵人",
      "攝夢人",
      "白痴",
      "愚者",
      "烏鴉",
      "邱比特",
      "混血兒",
      "暗戀者",
      "孤獨少女"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf_king",
          "count": 1
        },
        {
          "roleId": "nightmare",
          "count": 1
        },
        {
          "roleId": "wolf_witch",
          "count": 1
        },
        {
          "roleId": "time_eclipse_consort",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        },
        {
          "roleId": "crow",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "cupid",
          "count": 1
        },
        {
          "roleId": "hybrid",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "hybrid_choose",
          "actorLabel": "混血兒",
          "actorRoleIds": [
            "hybrid"
          ],
          "actionType": "hybrid_choose",
          "openPrompt": "混血兒請睜眼",
          "actionPrompt": "請選擇你要混的玩家",
          "closePrompt": "混血兒請閉眼"
        },
        {
          "stepId": "cupid_link",
          "actorLabel": "邱比特",
          "actorRoleIds": [
            "cupid"
          ],
          "actionType": "cupid_link",
          "openPrompt": "邱比特請睜眼",
          "actionPrompt": "請選擇情侶",
          "closePrompt": "邱比特請閉眼"
        },
        {
          "stepId": "step_3",
          "actorLabel": "情侶",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "情侶請睜眼",
          "actionPrompt": "請確認彼此",
          "closePrompt": "情侶請閉眼",
          "judgeTips": [
            "(法官走若干圈告知情侶分別是誰)"
          ]
        },
        {
          "stepId": "nightmare_fear",
          "actorLabel": "夢魘",
          "actorRoleIds": [
            "nightmare"
          ],
          "actionType": "nightmare_fear",
          "openPrompt": "夢魘請睜眼",
          "actionPrompt": "請選擇要恐懼的玩家",
          "closePrompt": "夢魘請閉眼"
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf_king",
            "nightmare",
            "wolf_witch",
            "time_eclipse_consort"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "time_eclipse_lock",
          "actorLabel": "蝕時狼妃",
          "actorRoleIds": [
            "time_eclipse_consort"
          ],
          "actionType": "time_eclipse_lock",
          "openPrompt": "蝕時狼妃請睜眼",
          "actionPrompt": "請選擇要封鎖的玩家",
          "closePrompt": "蝕時狼妃請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "crow_curse",
          "actorLabel": "烏鴉",
          "actorRoleIds": [
            "crow"
          ],
          "actionType": "crow_curse",
          "openPrompt": "烏鴉請睜眼",
          "actionPrompt": "請選擇要詛咒的玩家",
          "closePrompt": "烏鴉請閉眼"
        },
        {
          "stepId": "step_12",
          "actorLabel": "白痴",
          "actorRoleIds": [
            "idiot"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白痴請睜眼",
          "actionPrompt": "(確認白痴是誰)",
          "closePrompt": "白痴請閉眼"
        },
        {
          "stepId": "wolf_witch_check",
          "actorLabel": "狼巫",
          "actorRoleIds": [
            "wolf_witch"
          ],
          "actionType": "wolf_witch_check",
          "openPrompt": "狼巫請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "狼巫請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "nightmare_fear",
          "actorLabel": "夢魘",
          "actorRoleIds": [
            "nightmare"
          ],
          "actionType": "nightmare_fear",
          "openPrompt": "夢魘請睜眼",
          "actionPrompt": "請選擇要恐懼的玩家",
          "closePrompt": "夢魘請閉眼"
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf_king",
            "nightmare",
            "wolf_witch",
            "time_eclipse_consort"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_witch_check",
          "actorLabel": "狼巫",
          "actorRoleIds": [
            "wolf_witch"
          ],
          "actionType": "wolf_witch_check",
          "openPrompt": "狼巫請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "狼巫請閉眼"
        },
        {
          "stepId": "time_eclipse_lock",
          "actorLabel": "蝕時狼妃",
          "actorRoleIds": [
            "time_eclipse_consort"
          ],
          "actionType": "time_eclipse_lock",
          "openPrompt": "蝕時狼妃請睜眼",
          "actionPrompt": "請選擇要封鎖的玩家",
          "closePrompt": "蝕時狼妃請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "crow_curse",
          "actorLabel": "烏鴉",
          "actorRoleIds": [
            "crow"
          ],
          "actionType": "crow_curse",
          "openPrompt": "烏鴉請睜眼",
          "actionPrompt": "請選擇要詛咒的玩家",
          "closePrompt": "烏鴉請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-cupid-qa-1",
        "question": "如果混血兒混狼人，但是狼人進鍊子，獲勝條件為何？",
        "answer": "如果鍊子是狼狼鍊就是狼人陣營，如果是人狼鍊就是第三方陣營。",
        "relatedRoleIds": [
          "hybrid"
        ]
      },
      {
        "id": "12p-cupid-qa-2",
        "question": "如果混血兒混邱比特，獲勝條件為何？",
        "answer": "如果鍊子是狼狼鍊就是狼人陣營，如果是人狼鍊就是第三方陣營。",
        "relatedRoleIds": [
          "cupid",
          "hybrid"
        ]
      },
      {
        "id": "12p-cupid-qa-3",
        "question": "如果混血兒進鍊子，恰好混鍊子中另一位，獲勝條件為何？",
        "answer": "如果對方是狼就是人狼鍊為第三方陣營，如果對方是好人就是好人陣營。",
        "relatedRoleIds": [
          "hybrid"
        ]
      },
      {
        "id": "12p-cupid-qa-4",
        "question": "如果混血兒混狼人，同時與好人進鍊子，獲勝條件為何？",
        "answer": "此時依然為狼人陣營。",
        "relatedRoleIds": [
          "hybrid"
        ]
      },
      {
        "id": "12p-cupid-qa-5",
        "question": "守衛守護被蝕時狼妃封鎖的人會被視為自守，那下一晚還能自守嗎？",
        "answer": "可以，但是不能守護上一晚被封鎖的玩家。",
        "relatedRoleIds": [
          "time_eclipse_consort"
        ]
      },
      {
        "id": "12p-cupid-qa-6",
        "question": "若狼隊刀了蝕時狼妃夜晚封鎖的目標，而守衛女巫同守同救，會發生什麼？",
        "answer": "若該目標不是守衛，守衛的守護被反彈，視為該目標被狼刀後被女巫救，因此不會出局。若該目標是守衛，守衛的守護被狼妃反彈後依舊作用於自身，仍視為同守同救，因此被奶穿出局。",
        "relatedRoleIds": [
          "time_eclipse_consort",
          "witch"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "idiotNeedsExtraKill",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "12p-crow-cursed-fox",
    "name": "12 人局 - 烏鴉咒狐",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "烏鴉咒狐",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "烏鴉",
      "咒狐"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "crow",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "cursed_fox",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "step_1",
          "actorLabel": "咒狐",
          "actorRoleIds": [
            "cursed_fox"
          ],
          "actionType": "confirm_only",
          "openPrompt": "咒狐請睜眼",
          "actionPrompt": "(確認咒狐是誰)",
          "closePrompt": "咒狐請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "crow_curse",
          "actorLabel": "烏鴉",
          "actorRoleIds": [
            "crow"
          ],
          "actionType": "crow_curse",
          "openPrompt": "烏鴉請睜眼",
          "actionPrompt": "請選擇要詛咒的玩家",
          "closePrompt": "烏鴉請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "crow_curse",
          "actorLabel": "烏鴉",
          "actorRoleIds": [
            "crow"
          ],
          "actionType": "crow_curse",
          "openPrompt": "烏鴉請睜眼",
          "actionPrompt": "請選擇要詛咒的玩家",
          "closePrompt": "烏鴉請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "12p-hybrid",
    "name": "12 人局 - 混血兒",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "混血兒",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛",
      "暗戀者",
      "孤獨少女"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 4
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "hybrid",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "hybrid_choose",
          "actorLabel": "混血兒",
          "actorRoleIds": [
            "hybrid"
          ],
          "actionType": "hybrid_choose",
          "openPrompt": "混血兒請睜眼",
          "actionPrompt": "請選擇你要混的玩家",
          "closePrompt": "混血兒請閉眼"
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-hybrid-qa-1",
        "question": "混血兒混到好人算是平民還是神職？",
        "answer": "無論混到誰都是平民。",
        "relatedRoleIds": [
          "hybrid",
          "villager"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "12p-wind-espionage",
    "name": "12 人局 - 風聲諜影",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "風聲諜影",
      "12人",
      "機械狼",
      "覺醒隱狼",
      "覺醒石像鬼",
      "預言家",
      "通靈師",
      "魔鏡少女",
      "熊",
      "馴熊師",
      "女巫",
      "獵人",
      "河豚",
      "攝夢人",
      "白貓",
      "混血兒",
      "暗戀者",
      "孤獨少女"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "mech_wolf",
          "count": 1
        },
        {
          "roleId": "awakened_gargoyle",
          "count": 2
        }
      ],
      "good": [
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "psychic",
          "count": 1
        },
        {
          "roleId": "bear",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "pufferfish",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        },
        {
          "roleId": "white_cat",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "hybrid",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "hybrid_choose",
          "actorLabel": "混血兒",
          "actorRoleIds": [
            "hybrid"
          ],
          "actionType": "hybrid_choose",
          "openPrompt": "混血兒請睜眼",
          "actionPrompt": "請選擇你要混的玩家",
          "closePrompt": "混血兒請閉眼"
        },
        {
          "stepId": "mech_wolf_learn",
          "actorLabel": "機械狼",
          "actorRoleIds": [
            "mech_wolf"
          ],
          "actionType": "mech_wolf_learn",
          "openPrompt": "機械狼請睜眼",
          "actionPrompt": "請選擇要學習的對象",
          "closePrompt": "機械狼請閉眼"
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "mech_wolf",
            "awakened_gargoyle"
          ],
          "actionType": "confirm_only",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "awakened_gargoyle_convert",
          "actorLabel": "覺醒石像鬼 A",
          "actorRoleIds": [
            "awakened_gargoyle"
          ],
          "actionType": "awakened_gargoyle_convert",
          "openPrompt": "覺醒石像鬼 A 請睜眼",
          "actionPrompt": "請選擇轉化的玩家",
          "closePrompt": "覺醒石像鬼 A 請閉眼"
        },
        {
          "stepId": "awakened_gargoyle_convert_2",
          "actorLabel": "覺醒石像鬼 B",
          "actorRoleIds": [
            "awakened_gargoyle"
          ],
          "actionType": "awakened_gargoyle_convert",
          "openPrompt": "覺醒石像鬼 B 請睜眼",
          "actionPrompt": "請選擇轉化的玩家",
          "closePrompt": "覺醒石像鬼 B 請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_10",
          "actorLabel": "熊",
          "actorRoleIds": [
            "bear"
          ],
          "actionType": "confirm_only",
          "openPrompt": "熊請睜眼",
          "actionPrompt": "(確認熊是誰)",
          "closePrompt": "熊請閉眼"
        },
        {
          "stepId": "step_11",
          "actorLabel": "河豚",
          "actorRoleIds": [
            "pufferfish"
          ],
          "actionType": "confirm_only",
          "openPrompt": "河豚請睜眼",
          "actionPrompt": "(確認河豚是誰)",
          "closePrompt": "河豚請閉眼"
        },
        {
          "stepId": "step_12",
          "actorLabel": "白貓",
          "actorRoleIds": [
            "white_cat"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白貓請睜眼",
          "actionPrompt": "(確認白貓是誰)",
          "closePrompt": "白貓請閉眼"
        },
        {
          "stepId": "psychic_check",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "psychic_check",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "通靈師請閉眼"
        },
        {
          "stepId": "mech_wolf_reveal_skill",
          "actorLabel": "機械狼",
          "actorRoleIds": [
            "mech_wolf"
          ],
          "actionType": "mech_wolf_reveal_skill",
          "openPrompt": "機械狼請睜眼",
          "actionPrompt": "你學習到的技能為...",
          "closePrompt": "機械狼請閉眼",
          "judgeTips": [
            "(法官走若干圈告知轉化者 A 和轉化者 B 是誰)"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "mech_wolf_night_action",
          "actorLabel": "機械狼",
          "actorRoleIds": [
            "mech_wolf"
          ],
          "actionType": "mech_wolf_night_action",
          "openPrompt": "機械狼請睜眼",
          "actionPrompt": "今晚的入隊手勢為...\n請問你要使用技能嗎？",
          "closePrompt": "機械狼請閉眼"
        },
        {
          "stepId": "step_3",
          "actorLabel": "轉化者 A",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "轉化者 A 請睜眼",
          "actionPrompt": "今晚的入隊手勢為...",
          "closePrompt": "轉化者 A 請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "step_4",
          "actorLabel": "轉化者 B",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "轉化者 B 請睜眼",
          "actionPrompt": "今晚的入隊手勢為...",
          "closePrompt": "轉化者 B 請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "step_5",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "mech_wolf",
            "awakened_gargoyle"
          ],
          "actionType": "confirm_only",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "psychic_check",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "psychic_check",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "通靈師請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-wind-espionage-qa-1",
        "question": "機械狼可以學習已經翻牌的河豚或白貓嗎？",
        "answer": "河豚可以，但是白貓不行。",
        "relatedRoleIds": [
          "mech_wolf",
          "pufferfish",
          "white_cat"
        ]
      },
      {
        "id": "12p-wind-espionage-qa-2",
        "question": "如果覺醒石像鬼轉化機械狼會如何？",
        "answer": "轉化失敗，機械狼不會知道自己被轉化。",
        "relatedRoleIds": [
          "awakened_gargoyle",
          "mech_wolf"
        ]
      },
      {
        "id": "12p-wind-espionage-qa-3",
        "question": "如果覺醒石像鬼轉化混血兒會如何？",
        "answer": "轉化失敗，混血兒勝利條件始終跟隨混的對象，但是混血兒知道自己有被轉化。",
        "relatedRoleIds": [
          "awakened_gargoyle",
          "hybrid"
        ]
      },
      {
        "id": "12p-wind-espionage-qa-4",
        "question": "如果狼隊只剩兩位轉化者和機械狼怎麼辦？",
        "answer": "狼隊必須要只剩下最後一位才能入狼隊刀人，否則會卡刀，沒人能刀人。",
        "relatedRoleIds": [
          "mech_wolf"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "mechWolfForceLearnNight1",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "12p-board-1hfx9f2",
    "name": "12 人局 - 雲端探查",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "雲端探查",
      "12人",
      "狼美人",
      "機械狼",
      "覺醒隱狼",
      "隱狼",
      "預言家",
      "覺醒預言家",
      "通靈師",
      "魔鏡少女",
      "純白之女",
      "女巫",
      "獵人",
      "守墓人",
      "咒狐",
      "混血兒",
      "暗戀者",
      "孤獨少女"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf_beauty",
          "count": 1
        },
        {
          "roleId": "mech_wolf",
          "count": 1
        },
        {
          "roleId": "hidden_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "awakened_seer",
          "count": 1
        },
        {
          "roleId": "psychic",
          "count": 1
        },
        {
          "roleId": "pure_white_maiden",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "gravekeeper",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "cursed_fox",
          "count": 1
        },
        {
          "roleId": "hybrid",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "hybrid_choose",
          "actorLabel": "混血兒",
          "actorRoleIds": [
            "hybrid"
          ],
          "actionType": "hybrid_choose",
          "openPrompt": "混血兒請睜眼",
          "actionPrompt": "請選擇你要混的玩家",
          "closePrompt": "混血兒請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "咒狐",
          "actorRoleIds": [
            "cursed_fox"
          ],
          "actionType": "confirm_only",
          "openPrompt": "咒狐請睜眼",
          "actionPrompt": "(確認咒狐是誰)",
          "closePrompt": "咒狐請閉眼"
        },
        {
          "stepId": "mech_wolf_learn",
          "actorLabel": "機械狼",
          "actorRoleIds": [
            "mech_wolf"
          ],
          "actionType": "mech_wolf_learn",
          "openPrompt": "機械狼請睜眼",
          "actionPrompt": "請選擇要學習的對象",
          "closePrompt": "機械狼請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼"
        },
        {
          "stepId": "step_6",
          "actorLabel": "隱狼",
          "actorRoleIds": [
            "hidden_wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "隱狼請睜眼",
          "actionPrompt": "你的狼隊友為...(狼美人是...機械狼是...)",
          "closePrompt": "隱狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "awakened_seer_check",
          "actorLabel": "覺醒預言家",
          "actorRoleIds": [
            "awakened_seer"
          ],
          "actionType": "awakened_seer_check",
          "openPrompt": "覺醒預言家請睜眼",
          "actionPrompt": "請選擇要查驗的兩位玩家，他們的結果是...",
          "closePrompt": "覺醒預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_11",
          "actorLabel": "守墓人",
          "actorRoleIds": [
            "gravekeeper"
          ],
          "actionType": "confirm_only",
          "openPrompt": "守墓人請睜眼",
          "actionPrompt": "(確認守墓人是誰)",
          "closePrompt": "守墓人請閉眼"
        },
        {
          "stepId": "step_12",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "confirm_only",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "(確認通靈師是誰)",
          "closePrompt": "通靈師請閉眼"
        },
        {
          "stepId": "step_13",
          "actorLabel": "純白之女",
          "actorRoleIds": [
            "pure_white_maiden"
          ],
          "actionType": "confirm_only",
          "openPrompt": "純白之女請睜眼",
          "actionPrompt": "(確認純白之女是誰)",
          "closePrompt": "純白之女請閉眼"
        },
        {
          "stepId": "psychic_check",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "psychic_check",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "通靈師請閉眼"
        },
        {
          "stepId": "pure_white_check",
          "actorLabel": "純白之女",
          "actorRoleIds": [
            "pure_white_maiden"
          ],
          "actionType": "pure_white_check",
          "openPrompt": "純白之女請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "純白之女請閉眼"
        },
        {
          "stepId": "mech_wolf_reveal_skill",
          "actorLabel": "機械狼",
          "actorRoleIds": [
            "mech_wolf"
          ],
          "actionType": "mech_wolf_reveal_skill",
          "openPrompt": "機械狼請睜眼",
          "actionPrompt": "你學習到的技能為...",
          "closePrompt": "機械狼請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "mech_wolf_night_action",
          "actorLabel": "機械狼",
          "actorRoleIds": [
            "mech_wolf"
          ],
          "actionType": "mech_wolf_night_action",
          "openPrompt": "機械狼請睜眼",
          "actionPrompt": "今晚的入隊手勢為...\n請問你要使用技能嗎？",
          "closePrompt": "機械狼請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "隱狼",
          "actorRoleIds": [
            "hidden_wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "隱狼請睜眼",
          "actionPrompt": "今晚的入隊手勢為...",
          "closePrompt": "隱狼請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "wolf_beauty_charm",
          "actorLabel": "狼美人",
          "actorRoleIds": [
            "wolf_beauty"
          ],
          "actionType": "wolf_beauty_charm",
          "openPrompt": "狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "狼美人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "awakened_seer_check",
          "actorLabel": "覺醒預言家",
          "actorRoleIds": [
            "awakened_seer"
          ],
          "actionType": "awakened_seer_check",
          "openPrompt": "覺醒預言家請睜眼",
          "actionPrompt": "請選擇要查驗的兩位玩家，他們的結果是...",
          "closePrompt": "覺醒預言家請閉眼"
        },
        {
          "stepId": "psychic_check",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "psychic_check",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "通靈師請閉眼"
        },
        {
          "stepId": "pure_white_check",
          "actorLabel": "純白之女",
          "actorRoleIds": [
            "pure_white_maiden"
          ],
          "actionType": "pure_white_check",
          "openPrompt": "純白之女請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "純白之女請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "gravekeeper_check",
          "actorLabel": "守墓人",
          "actorRoleIds": [
            "gravekeeper"
          ],
          "actionType": "gravekeeper_check",
          "openPrompt": "守墓人請睜眼",
          "actionPrompt": "昨天被放逐玩家的身分是...",
          "closePrompt": "守墓人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-board-1hfx9f2-qa-1",
        "question": "如果狼隊只剩隱狼和機械狼怎麼辦？",
        "answer": "狼隊必須要只剩下最後一位才能入狼隊刀人，否則會卡刀，沒人能刀人。",
        "relatedRoleIds": [
          "mech_wolf",
          "hidden_wolf"
        ]
      },
      {
        "id": "12p-board-1hfx9f2-qa-2",
        "question": "如果最後一狼和咒狐出局誰獲勝？",
        "answer": "視為咒狐獲勝，最後一民或最後一神和咒狐出局也是同樣道理，咒狐獲勝。",
        "relatedRoleIds": [
          "cursed_fox"
        ]
      },
      {
        "id": "12p-board-1hfx9f2-qa-3",
        "question": "如果純白之女查驗機械狼會如何？",
        "answer": "如果機械狼尚未學習其他身分或學到狼人陣營則會出局，否則僅會顯示機械狼學習的好人身分。",
        "relatedRoleIds": [
          "pure_white_maiden",
          "mech_wolf"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "mechWolfForceLearnNight1",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "12p-salon-night",
    "name": "12 人局 - 沙龍之夜",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "沙龍之夜",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "覺醒狼美人",
      "蝕日侍女",
      "蝕時狼妃",
      "覺醒預言家",
      "通靈師",
      "魔鏡少女",
      "女巫",
      "獵魔人",
      "攝夢人",
      "奇蹟商人",
      "咒狐"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 1
        },
        {
          "roleId": "awakened_wolf_beauty",
          "count": 1
        },
        {
          "roleId": "eclipse_maid",
          "count": 1
        },
        {
          "roleId": "time_eclipse_consort",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "awakened_seer",
          "count": 1
        },
        {
          "roleId": "psychic",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "demon_hunter",
          "count": 2
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        },
        {
          "roleId": "miracle_merchant",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "cursed_fox",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "step_1",
          "actorLabel": "咒狐",
          "actorRoleIds": [
            "cursed_fox"
          ],
          "actionType": "confirm_only",
          "openPrompt": "咒狐請睜眼",
          "actionPrompt": "(確認咒狐是誰)",
          "closePrompt": "咒狐請閉眼"
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "awakened_wolf_beauty_charm",
          "actorLabel": "覺醒狼美人",
          "actorRoleIds": [
            "awakened_wolf_beauty"
          ],
          "actionType": "awakened_wolf_beauty_charm",
          "openPrompt": "覺醒狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "覺醒狼美人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "awakened_wolf_beauty",
            "eclipse_maid",
            "time_eclipse_consort"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "time_eclipse_lock",
          "actorLabel": "蝕時狼妃",
          "actorRoleIds": [
            "time_eclipse_consort"
          ],
          "actionType": "time_eclipse_lock",
          "openPrompt": "蝕時狼妃請睜眼",
          "actionPrompt": "請選擇要封鎖的玩家",
          "closePrompt": "蝕時狼妃請閉眼"
        },
        {
          "stepId": "eclipse_maid_devour",
          "actorLabel": "蝕日侍女",
          "actorRoleIds": [
            "eclipse_maid"
          ],
          "actionType": "eclipse_maid_devour",
          "openPrompt": "蝕日侍女請睜眼",
          "actionPrompt": "你的狼隊友為...(小狼是...覺醒狼美人是...蝕時狼妃是...)",
          "closePrompt": "蝕日侍女請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "awakened_seer_check",
          "actorLabel": "覺醒預言家",
          "actorRoleIds": [
            "awakened_seer"
          ],
          "actionType": "awakened_seer_check",
          "openPrompt": "覺醒預言家請睜眼",
          "actionPrompt": "請選擇要查驗的兩位玩家，他們的結果是...",
          "closePrompt": "覺醒預言家請閉眼"
        },
        {
          "stepId": "step_9",
          "actorLabel": "獵魔人 A",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "confirm_only",
          "openPrompt": "獵魔人 A 請睜眼",
          "actionPrompt": "(確認獵魔人 A 是誰)",
          "closePrompt": "獵魔人 A 請閉眼"
        },
        {
          "stepId": "step_10",
          "actorLabel": "獵魔人 B",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "confirm_only",
          "openPrompt": "獵魔人 B 請睜眼",
          "actionPrompt": "(確認獵魔人 B 是誰)",
          "closePrompt": "獵魔人 B 請閉眼"
        },
        {
          "stepId": "miracle_merchant_gift",
          "actorLabel": "奇蹟商人",
          "actorRoleIds": [
            "miracle_merchant"
          ],
          "actionType": "miracle_merchant_gift",
          "openPrompt": "奇蹟商人請睜眼",
          "actionPrompt": "你選擇幸運兒和要給的禮物",
          "closePrompt": "奇蹟商人請閉眼"
        },
        {
          "stepId": "lucky_item_action",
          "actorLabel": "幸運兒",
          "actorRoleIds": [],
          "actionType": "lucky_item_action",
          "openPrompt": "幸運兒請睜眼",
          "actionPrompt": "你獲得的技能是...，請問你是否要使用技能",
          "closePrompt": "幸運兒請閉眼",
          "judgeTips": [
            "(法官走若干圈告知幸運兒是誰)"
          ]
        },
        {
          "stepId": "psychic_check",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "psychic_check",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "通靈師請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "eclipse_maid_devour",
          "actorLabel": "蝕日侍女",
          "actorRoleIds": [
            "eclipse_maid"
          ],
          "actionType": "eclipse_maid_devour",
          "openPrompt": "蝕日侍女請睜眼",
          "actionPrompt": "請選擇要吞噬的目標，\n你偷到的技能為...，請問你要使用嗎？",
          "closePrompt": "蝕日侍女請閉眼"
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "今晚的技能狀態為...\n請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "awakened_wolf_beauty_charm",
          "actorLabel": "覺醒狼美人",
          "actorRoleIds": [
            "awakened_wolf_beauty"
          ],
          "actionType": "awakened_wolf_beauty_charm",
          "openPrompt": "覺醒狼美人請睜眼",
          "actionPrompt": "請選擇要魅惑的玩家",
          "closePrompt": "覺醒狼美人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "awakened_wolf_beauty",
            "eclipse_maid",
            "time_eclipse_consort"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "time_eclipse_lock",
          "actorLabel": "蝕時狼妃",
          "actorRoleIds": [
            "time_eclipse_consort"
          ],
          "actionType": "time_eclipse_lock",
          "openPrompt": "蝕時狼妃請睜眼",
          "actionPrompt": "請選擇要封鎖的玩家",
          "closePrompt": "蝕時狼妃請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "今晚的技能狀態為...\n昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "awakened_seer_check",
          "actorLabel": "覺醒預言家",
          "actorRoleIds": [
            "awakened_seer"
          ],
          "actionType": "awakened_seer_check",
          "openPrompt": "覺醒預言家請睜眼",
          "actionPrompt": "今晚的技能狀態為...\n請選擇要查驗的兩位玩家，他們的結果是...",
          "closePrompt": "覺醒預言家請閉眼"
        },
        {
          "stepId": "psychic_check",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "psychic_check",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "今晚的技能狀態為...\n請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "通靈師請閉眼"
        },
        {
          "stepId": "demon_hunter_hunt",
          "actorLabel": "獵魔人 A",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "demon_hunter_hunt",
          "openPrompt": "獵魔人 A 請睜眼",
          "actionPrompt": "今晚的技能狀態為...\n請選擇要狩獵的目標",
          "closePrompt": "獵魔人 A 請閉眼"
        },
        {
          "stepId": "demon_hunter_hunt_2",
          "actorLabel": "獵魔人 B",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "demon_hunter_hunt",
          "openPrompt": "獵魔人 B 請睜眼",
          "actionPrompt": "今晚的技能狀態為...\n請選擇要狩獵的目標",
          "closePrompt": "獵魔人 B 請閉眼"
        },
        {
          "stepId": "lucky_item_action",
          "actorLabel": "幸運兒",
          "actorRoleIds": [],
          "actionType": "lucky_item_action",
          "openPrompt": "幸運兒請睜眼",
          "actionPrompt": "請問你是否要使用技能",
          "closePrompt": "幸運兒請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-salon-night-qa-1",
        "question": "如果攝夢人攝夢被蝕時狼妃封鎖的人導致變成攝夢自己，而下一晚蝕日侍女吞噬攝夢人技能並攝夢攝夢人，是否會導致攝夢人死亡。",
        "answer": "會，因為攝夢人連續兩晚被攝夢。",
        "relatedRoleIds": [
          "time_eclipse_consort",
          "eclipse_maid",
          "dream_catcher"
        ]
      },
      {
        "id": "12p-salon-night-qa-2",
        "question": "如果最後一狼和咒狐出局誰獲勝？",
        "answer": "視為咒狐獲勝，最後一民或最後一神和咒狐出局也是同樣道理，咒狐獲勝。",
        "relatedRoleIds": [
          "cursed_fox"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "12p-awakened-lonely-girl",
    "name": "12 人局 - 覺醒孤獨少女",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "覺醒孤獨少女",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "攝夢人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 4
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "awakened_lonely_girl",
          "count": 1
        }
      ]
    },
    "isFlexibleComposition": true,
    "compositionNote": "牌池共 13 張牌（含盜賊／額外底牌），從中發出 12 張上場。",
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "awakened_lonely_girl_choose",
          "actorLabel": "覺醒孤獨少女",
          "actorRoleIds": [
            "awakened_lonely_girl"
          ],
          "actionType": "awakened_lonely_girl_choose",
          "openPrompt": "覺醒孤獨少女請睜眼",
          "actionPrompt": "請選擇你的偶像",
          "closePrompt": "覺醒孤獨少女請閉眼"
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "step_1",
          "actorLabel": "覺醒孤獨少女",
          "actorRoleIds": [
            "awakened_lonely_girl"
          ],
          "actionType": "confirm_only",
          "openPrompt": "覺醒孤獨少女請睜眼",
          "actionPrompt": "繼承手勢為...，你繼承的身分是...",
          "closePrompt": "覺醒孤獨少女請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-awakened-lonely-girl-qa-1",
        "question": "覺醒孤獨少女崇拜到好人算是平民還是神職？",
        "answer": "兩者都不是，覺醒孤獨少女是第三方陣營，崇拜到好人算勝利條件與好人陣營相同。",
        "relatedRoleIds": [
          "awakened_lonely_girl",
          "villager"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "12p-wild-child",
    "name": "12 人局 - 野孩子",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "野孩子",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 4
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "wild_child",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wild_child_choose",
          "actorLabel": "野孩子",
          "actorRoleIds": [
            "wild_child"
          ],
          "actionType": "wild_child_choose",
          "openPrompt": "野孩子請睜眼",
          "actionPrompt": "請選擇你的榜樣",
          "closePrompt": "野孩子請閉眼"
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-wild-child-qa-1",
        "question": "野孩子算是平民還是神職？",
        "answer": "平民，除非榜樣死亡。",
        "relatedRoleIds": [
          "wild_child",
          "villager"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "12p-board-18sbphw",
    "name": "12 人局 - 千年之戀",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "千年之戀",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "蝕日侍女",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "流光伯爵",
      "白蛇預言家",
      "許仙尋香魅影"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "eclipse_maid",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "radiant_earl",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "white_snake_seer",
          "count": 1
        },
        {
          "roleId": "xu_xian_phantom",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "xu_xian_action",
          "actorLabel": "許仙尋香魅影",
          "actorRoleIds": [
            "xu_xian_phantom"
          ],
          "actionType": "xu_xian_action",
          "openPrompt": "許仙尋香魅影請睜眼",
          "actionPrompt": "請選擇要綁定的兩名玩家",
          "closePrompt": "許仙尋香魅影請閉眼"
        },
        {
          "stepId": "white_snake_action",
          "actorLabel": "白蛇預言家",
          "actorRoleIds": [
            "white_snake_seer"
          ],
          "actionType": "white_snake_action",
          "openPrompt": "白蛇預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他是否為許仙尋香魅影",
          "closePrompt": "白蛇預言家請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "eclipse_maid"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "eclipse_maid_devour",
          "actorLabel": "蝕日侍女",
          "actorRoleIds": [
            "eclipse_maid"
          ],
          "actionType": "eclipse_maid_devour",
          "openPrompt": "蝕日侍女請睜眼",
          "actionPrompt": "你的狼隊友為...",
          "closePrompt": "蝕日侍女請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢為...",
          "closePrompt": "獵人請閉眼"
        },
        {
          "stepId": "step_8",
          "actorLabel": "流光伯爵",
          "actorRoleIds": [
            "radiant_earl"
          ],
          "actionType": "confirm_only",
          "openPrompt": "流光伯爵請睜眼",
          "actionPrompt": "(確認流光伯爵是誰)",
          "closePrompt": "流光伯爵請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "eclipse_maid_devour",
          "actorLabel": "蝕日侍女",
          "actorRoleIds": [
            "eclipse_maid"
          ],
          "actionType": "eclipse_maid_devour",
          "openPrompt": "蝕日侍女請睜眼",
          "actionPrompt": "請選擇要吞噬的目標，\n你偷到的技能為...，請問你要使用嗎？",
          "closePrompt": "蝕日侍女請閉眼"
        },
        {
          "stepId": "xu_xian_action",
          "actorLabel": "許仙尋香魅影",
          "actorRoleIds": [
            "xu_xian_phantom"
          ],
          "actionType": "xu_xian_action",
          "openPrompt": "許仙尋香魅影請睜眼",
          "actionPrompt": "請選擇要綁定的兩名玩家\n今晚的靈襲手勢為...請選擇要擊殺的目標",
          "closePrompt": "許仙尋香魅影請閉眼"
        },
        {
          "stepId": "white_snake_action",
          "actorLabel": "白蛇預言家",
          "actorRoleIds": [
            "white_snake_seer"
          ],
          "actionType": "white_snake_action",
          "openPrompt": "白蛇預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他是否為許仙尋香魅影\n今晚的靈襲手勢為...請選擇要擊殺的目標",
          "closePrompt": "白蛇預言家請閉眼"
        },
        {
          "stepId": "radiant_earl_shield",
          "actorLabel": "流光伯爵",
          "actorRoleIds": [
            "radiant_earl"
          ],
          "actionType": "radiant_earl_shield",
          "openPrompt": "流光伯爵請睜眼",
          "actionPrompt": "請選擇要庇護的玩家",
          "closePrompt": "流光伯爵請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "eclipse_maid"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢為...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-board-18sbphw-qa-1",
        "question": "如果蝕日侍女吞噬被庇護的預言家，蝕日侍女是否吞噬到查驗？",
        "answer": "有，但是白天蝕日侍女就會死亡。",
        "relatedRoleIds": [
          "eclipse_maid",
          "seer"
        ]
      },
      {
        "id": "12p-board-18sbphw-qa-2",
        "question": "如果蝕日侍女吞噬流光伯爵，蝕日侍女是否吞噬到庇護？",
        "answer": "有，可以庇護自己以外的任何一人，但是白天蝕日侍女就會死亡。",
        "relatedRoleIds": [
          "eclipse_maid",
          "radiant_earl"
        ]
      },
      {
        "id": "12p-board-18sbphw-qa-3",
        "question": "蝕日侍女偷白蛇預言家的查驗並驗出許仙尋香魅影，是否會解鎖白蛇預言家的靈襲？",
        "answer": "不會，必須是白蛇預言家本人親自查驗到許仙尋香魅影才能解鎖。",
        "relatedRoleIds": [
          "xu_xian_phantom",
          "white_snake_seer",
          "eclipse_maid",
          "seer"
        ]
      },
      {
        "id": "12p-board-18sbphw-qa-4",
        "question": "蝕日侍女能偷靈襲技能嗎？",
        "answer": "不能，靈襲不是技能。",
        "relatedRoleIds": [
          "eclipse_maid"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "12p-ghost-bride",
    "name": "12 人局 - 鬼魂新娘",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "鬼魂新娘",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "守衛",
      "鬼新娘",
      "鬼魅新娘"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "ghost_bride",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "ghost_bride_link",
          "actorLabel": "鬼魂新娘",
          "actorRoleIds": [
            "ghost_bride"
          ],
          "actionType": "ghost_bride_link",
          "openPrompt": "鬼魂新娘請睜眼",
          "actionPrompt": "請選擇你的新郎",
          "closePrompt": "鬼魂新娘請閉眼"
        },
        {
          "stepId": "ghost_bride_link_2",
          "actorLabel": "鬼魂新娘和新郎",
          "actorRoleIds": [
            "ghost_bride"
          ],
          "actionType": "ghost_bride_link",
          "openPrompt": "鬼魂新娘和新郎請睜眼",
          "actionPrompt": "請選擇你們的證婚人",
          "closePrompt": "鬼魂新娘和新郎請閉眼",
          "judgeTips": [
            "(法官走若干圈告知新郎是誰)"
          ]
        },
        {
          "stepId": "step_3",
          "actorLabel": "證婚人",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "證婚人請睜眼",
          "actionPrompt": "情侶分別為...",
          "closePrompt": "證婚人請閉眼",
          "judgeTips": [
            "(法官走若干圈告知證婚人是誰)",
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "ghost_bride_link",
          "actorLabel": "鬼魂新娘和新郎",
          "actorRoleIds": [
            "ghost_bride"
          ],
          "actionType": "ghost_bride_link",
          "openPrompt": "鬼魂新娘和新郎請睜眼",
          "actionPrompt": "今晚的帶刀手勢為...\n請選擇擊殺的目標",
          "closePrompt": "鬼魂新娘和新郎請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "證婚人",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "證婚人請睜眼",
          "actionPrompt": "今晚的帶刀手勢為...\n請選擇擊殺的目標",
          "closePrompt": "證婚人請閉眼",
          "judgeTips": [
            "此步驟由法官口頭引導；若產生出局或狀態變化，可點「座位總覽／手動標記」即時同步。"
          ]
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [
      {
        "id": "12p-ghost-bride-qa-1",
        "question": "鬼魂新娘、新郎和證婚人被預言家查驗結果為何？",
        "answer": "鬼魂新娘為金水，其餘兩人根據原身分決定。",
        "relatedRoleIds": [
          "ghost_bride",
          "seer"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "12p-zombie",
    "name": "12 人局 - 殭屍",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "殭屍",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "平民",
      "村民",
      "預言家",
      "女巫",
      "獵人",
      "魔術師"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 3
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "magician",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "zombie",
          "count": 1
        }
      ]
    },
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "zombie_infect",
          "actorLabel": "殭屍",
          "actorRoleIds": [
            "zombie"
          ],
          "actionType": "zombie_infect",
          "openPrompt": "殭屍請睜眼",
          "actionPrompt": "請選擇要感染的玩家",
          "closePrompt": "殭屍請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "所有感染者",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "所有感染者請睜眼",
          "actionPrompt": "(確認目前感染者有誰)",
          "closePrompt": "所有感染者請閉眼",
          "judgeTips": [
            "(法官走若干圈告知新感染者有誰)"
          ]
        },
        {
          "stepId": "magician_swap",
          "actorLabel": "魔術師",
          "actorRoleIds": [
            "magician"
          ],
          "actionType": "magician_swap",
          "openPrompt": "魔術師請睜眼",
          "actionPrompt": "請選擇要交換的號碼",
          "closePrompt": "魔術師請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "zombie_infect",
          "actorLabel": "殭屍",
          "actorRoleIds": [
            "zombie"
          ],
          "actionType": "zombie_infect",
          "openPrompt": "殭屍請睜眼",
          "actionPrompt": "請選擇要感染的玩家",
          "closePrompt": "殭屍請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "所有感染者",
          "actorRoleIds": [],
          "actionType": "confirm_only",
          "openPrompt": "所有感染者請睜眼",
          "actionPrompt": "(確認目前感染者有誰)",
          "closePrompt": "所有感染者請閉眼",
          "judgeTips": [
            "(法官走若干圈告知新感染者有誰)"
          ]
        },
        {
          "stepId": "magician_swap",
          "actorLabel": "魔術師",
          "actorRoleIds": [
            "magician"
          ],
          "actionType": "magician_swap",
          "openPrompt": "魔術師請睜眼",
          "actionPrompt": "請選擇要交換的號碼",
          "closePrompt": "魔術師請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼"
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "12p-treasure-master",
    "name": "12 人局 - 盜寶大師",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "盜寶大師",
      "12人",
      "小狼",
      "普通狼人",
      "狼人",
      "狼王",
      "黑狼王",
      "平民",
      "村民",
      "通靈師",
      "魔鏡少女",
      "毒師",
      "獵人",
      "攝夢人",
      "蒙面人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 5
        },
        {
          "roleId": "psychic",
          "count": 1
        },
        {
          "roleId": "poisoner",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "dream_catcher",
          "count": 1
        },
        {
          "roleId": "masked_villager",
          "count": 1
        }
      ],
      "thirdParty": [
        {
          "roleId": "treasure_master",
          "count": 1
        }
      ]
    },
    "isFlexibleComposition": true,
    "compositionNote": "牌池共 15 張牌（含盜賊／額外底牌），從中發出 12 張上場。",
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "step_2",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "confirm_only",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "(確認狼人、狼王是誰)",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "poisoner_poison",
          "actorLabel": "毒師",
          "actorRoleIds": [
            "poisoner"
          ],
          "actionType": "poisoner_poison",
          "openPrompt": "毒師請睜眼",
          "actionPrompt": "請選擇要毒的玩家",
          "closePrompt": "毒師請閉眼"
        },
        {
          "stepId": "step_4",
          "actorLabel": "蒙面人",
          "actorRoleIds": [
            "masked_villager"
          ],
          "actionType": "confirm_only",
          "openPrompt": "蒙面人請睜眼",
          "actionPrompt": "(確認蒙面人是誰)",
          "closePrompt": "蒙面人請閉眼"
        },
        {
          "stepId": "treasure_master_choose",
          "actorLabel": "盜寶大師",
          "actorRoleIds": [
            "treasure_master"
          ],
          "actionType": "treasure_master_choose",
          "openPrompt": "盜寶大師請睜眼",
          "actionPrompt": "剩餘的三個身分為...，請選擇一個身分",
          "closePrompt": "盜寶大師請閉眼"
        },
        {
          "stepId": "psychic_check",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "psychic_check",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "通靈師請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "treasure_master_choose",
          "actorLabel": "盜寶大師",
          "actorRoleIds": [
            "treasure_master"
          ],
          "actionType": "treasure_master_choose",
          "openPrompt": "盜寶大師請睜眼",
          "actionPrompt": "請選擇一個身分",
          "closePrompt": "盜寶大師請閉眼"
        },
        {
          "stepId": "dream_catcher_dream",
          "actorLabel": "攝夢人",
          "actorRoleIds": [
            "dream_catcher"
          ],
          "actionType": "dream_catcher_dream",
          "openPrompt": "攝夢人請睜眼",
          "actionPrompt": "請選擇要攝夢的玩家",
          "closePrompt": "攝夢人請閉眼"
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        },
        {
          "stepId": "poisoner_poison",
          "actorLabel": "毒師",
          "actorRoleIds": [
            "poisoner"
          ],
          "actionType": "poisoner_poison",
          "openPrompt": "毒師請睜眼",
          "actionPrompt": "請選擇要毒的玩家",
          "closePrompt": "毒師請閉眼"
        },
        {
          "stepId": "psychic_check",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "psychic_check",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "通靈師請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "wolfKillPriority",
      "victoryMode"
    ]
  },
  {
    "id": "multi-hunter",
    "name": "娛樂局 - 獵殺潛狼 / 獵人局",
    "playerCount": 6,
    "playerCountRange": [
      6,
      12
    ],
    "playerCountFilter": "multi",
    "keywords": [
      "娛樂局 - 獵殺潛狼",
      "獵人局",
      "小狼",
      "普通狼人",
      "狼人",
      "獵人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        }
      ],
      "good": [
        {
          "roleId": "hunter",
          "count": 4
        }
      ]
    },
    "isFlexibleComposition": true,
    "compositionNote": "娛樂局支援 6 / 10 / 12 人配置（小狼與獵人比例依人數調整）。",
    "presetPlayerCounts": [
      6,
      10,
      12
    ],
    "automationLevel": "partial_manual",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "step_1",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "confirm_only",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "(確認狼人們分別是誰)",
          "closePrompt": "狼人請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "wolfKillPriority"
    ]
  },
  {
    "id": "multi-lianliankan",
    "name": "娛樂局 - 連連看",
    "playerCount": 10,
    "playerCountFilter": "multi",
    "keywords": [
      "娛樂局 - 連連看",
      "尋香魅影",
      "獵魔人"
    ],
    "composition": {
      "wolf": [
        {
          "roleId": "scent_phantom",
          "count": 6
        }
      ],
      "good": [
        {
          "roleId": "demon_hunter",
          "count": 4
        }
      ]
    },
    "compositionNote": "娛樂局：6 名尋香魅影 vs 4 名獵魔人，第一晚無狼刀。",
    "automationLevel": "full",
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "scent_phantom_link",
          "actorLabel": "尋香魅影 A",
          "actorRoleIds": [
            "scent_phantom"
          ],
          "actionType": "scent_phantom_link",
          "openPrompt": "尋香魅影 A 請睜眼",
          "actionPrompt": "你其中的一位狼隊友為...\n請選擇要綁定的兩位玩家",
          "closePrompt": "尋香魅影 A 請閉眼"
        },
        {
          "stepId": "scent_phantom_link_2",
          "actorLabel": "尋香魅影 B",
          "actorRoleIds": [
            "scent_phantom"
          ],
          "actionType": "scent_phantom_link",
          "openPrompt": "尋香魅影 B 請睜眼",
          "actionPrompt": "你其中的一位狼隊友為...\n請選擇要綁定的兩位玩家",
          "closePrompt": "尋香魅影 B 請閉眼"
        },
        {
          "stepId": "scent_phantom_link_3",
          "actorLabel": "尋香魅影 C",
          "actorRoleIds": [
            "scent_phantom"
          ],
          "actionType": "scent_phantom_link",
          "openPrompt": "尋香魅影 C 請睜眼",
          "actionPrompt": "你其中的一位狼隊友為...\n請選擇要綁定的兩位玩家",
          "closePrompt": "尋香魅影 C 請閉眼"
        },
        {
          "stepId": "scent_phantom_link_4",
          "actorLabel": "尋香魅影 D",
          "actorRoleIds": [
            "scent_phantom"
          ],
          "actionType": "scent_phantom_link",
          "openPrompt": "尋香魅影 D 請睜眼",
          "actionPrompt": "你其中的一位狼隊友為...\n請選擇要綁定的兩位玩家",
          "closePrompt": "尋香魅影 D 請閉眼"
        },
        {
          "stepId": "scent_phantom_link_5",
          "actorLabel": "尋香魅影 E",
          "actorRoleIds": [
            "scent_phantom"
          ],
          "actionType": "scent_phantom_link",
          "openPrompt": "尋香魅影 E 請睜眼",
          "actionPrompt": "你其中的一位狼隊友為...\n請選擇要綁定的兩位玩家",
          "closePrompt": "尋香魅影 E 請閉眼"
        },
        {
          "stepId": "scent_phantom_link_6",
          "actorLabel": "尋香魅影 F",
          "actorRoleIds": [
            "scent_phantom"
          ],
          "actionType": "scent_phantom_link",
          "openPrompt": "尋香魅影 F 請睜眼",
          "actionPrompt": "你其中的一位狼隊友為...\n請選擇要綁定的兩位玩家",
          "closePrompt": "尋香魅影 F 請閉眼"
        }
      ],
      "subsequentNights": [
        {
          "stepId": "scent_phantom_link",
          "actorLabel": "尋香魅影 A",
          "actorRoleIds": [
            "scent_phantom"
          ],
          "actionType": "scent_phantom_link",
          "openPrompt": "尋香魅影 A 請睜眼",
          "actionPrompt": "今晚的帶刀手勢為...，請選擇今晚要擊殺的目標\n請選擇要綁定的兩位玩家",
          "closePrompt": "尋香魅影 A 請閉眼"
        },
        {
          "stepId": "scent_phantom_link_2",
          "actorLabel": "尋香魅影 B",
          "actorRoleIds": [
            "scent_phantom"
          ],
          "actionType": "scent_phantom_link",
          "openPrompt": "尋香魅影 B 請睜眼",
          "actionPrompt": "今晚的帶刀手勢為...，請選擇今晚要擊殺的目標\n請選擇要綁定的兩位玩家",
          "closePrompt": "尋香魅影 B 請閉眼"
        },
        {
          "stepId": "scent_phantom_link_3",
          "actorLabel": "尋香魅影 C",
          "actorRoleIds": [
            "scent_phantom"
          ],
          "actionType": "scent_phantom_link",
          "openPrompt": "尋香魅影 C 請睜眼",
          "actionPrompt": "今晚的帶刀手勢為...，請選擇今晚要擊殺的目標\n請選擇要綁定的兩位玩家",
          "closePrompt": "尋香魅影 C 請閉眼"
        },
        {
          "stepId": "scent_phantom_link_4",
          "actorLabel": "尋香魅影 D",
          "actorRoleIds": [
            "scent_phantom"
          ],
          "actionType": "scent_phantom_link",
          "openPrompt": "尋香魅影 D 請睜眼",
          "actionPrompt": "今晚的帶刀手勢為...，請選擇今晚要擊殺的目標\n請選擇要綁定的兩位玩家",
          "closePrompt": "尋香魅影 D 請閉眼"
        },
        {
          "stepId": "scent_phantom_link_5",
          "actorLabel": "尋香魅影 E",
          "actorRoleIds": [
            "scent_phantom"
          ],
          "actionType": "scent_phantom_link",
          "openPrompt": "尋香魅影 E 請睜眼",
          "actionPrompt": "今晚的帶刀手勢為...，請選擇今晚要擊殺的目標\n請選擇要綁定的兩位玩家",
          "closePrompt": "尋香魅影 E 請閉眼"
        },
        {
          "stepId": "scent_phantom_link_6",
          "actorLabel": "尋香魅影 F",
          "actorRoleIds": [
            "scent_phantom"
          ],
          "actionType": "scent_phantom_link",
          "openPrompt": "尋香魅影 F 請睜眼",
          "actionPrompt": "今晚的帶刀手勢為...，請選擇今晚要擊殺的目標\n請選擇要綁定的兩位玩家",
          "closePrompt": "尋香魅影 F 請閉眼"
        },
        {
          "stepId": "demon_hunter_hunt",
          "actorLabel": "獵魔人 A",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "demon_hunter_hunt",
          "openPrompt": "獵魔人 A 請睜眼",
          "actionPrompt": "請選擇要狩獵的目標",
          "closePrompt": "獵魔人 A 請閉眼"
        },
        {
          "stepId": "demon_hunter_hunt_2",
          "actorLabel": "獵魔人 B",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "demon_hunter_hunt",
          "openPrompt": "獵魔人 B 請睜眼",
          "actionPrompt": "請選擇要狩獵的目標",
          "closePrompt": "獵魔人 B 請閉眼"
        },
        {
          "stepId": "demon_hunter_hunt_3",
          "actorLabel": "獵魔人 C",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "demon_hunter_hunt",
          "openPrompt": "獵魔人 C 請睜眼",
          "actionPrompt": "請選擇要狩獵的目標",
          "closePrompt": "獵魔人 C 請閉眼"
        },
        {
          "stepId": "demon_hunter_hunt_4",
          "actorLabel": "獵魔人 D",
          "actorRoleIds": [
            "demon_hunter"
          ],
          "actionType": "demon_hunter_hunt",
          "openPrompt": "獵魔人 D 請睜眼",
          "actionPrompt": "請選擇要狩獵的目標",
          "closePrompt": "獵魔人 D 請閉眼"
        }
      ]
    },
    "qaList": [],
    "supportedRuleToggles": [
      "wolfKillPriority"
    ]
  }
];

export const MVP_BOARDS: BoardDefinition[] = [
  {
    "id": "12p-classic",
    "name": "12 人局 - 經典",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "經典",
      "預女獵白",
      "白痴",
      "愚者",
      "12人"
    ],
    "automationLevel": "full",
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 4
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "idiot",
          "count": 1
        }
      ]
    },
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "狼隊可選擇空刀或自刀；若有白天自爆狼人，於本步驟點刀後正式死亡。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "解藥與毒藥不可在同一晚同時使用；女巫能否自救請依本局規則開關判定。"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼",
          "judgeTips": [
            "僅告知所屬陣營（好人 / 狼人），不告知具體神職。"
          ]
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼",
          "judgeTips": [
            "被狼刀或放逐可開槍；若今晚被女巫毒殺則比出不可開槍手勢。"
          ]
        },
        {
          "stepId": "idiot_confirm",
          "actorLabel": "白痴",
          "actorRoleIds": [
            "idiot"
          ],
          "actionType": "confirm_only",
          "openPrompt": "白痴請睜眼",
          "actionPrompt": "(確認白痴是誰)",
          "closePrompt": "白痴請閉眼",
          "judgeTips": [
            "僅首夜確認白痴座位，第二晚起無須睜眼。"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "狼隊可選擇空刀或自刀；若有白天自爆狼人，於本步驟點刀後正式死亡。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "解藥與毒藥不可在同一晚同時使用；女巫能否自救請依本局規則開關判定。"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼",
          "judgeTips": [
            "僅告知所屬陣營（好人 / 狼人），不告知具體神職。"
          ]
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼",
          "judgeTips": [
            "被狼刀或放逐可開槍；若今晚被女巫毒殺則比出不可開槍手勢。"
          ]
        }
      ]
    },
    "qaList": [
      {
        "id": "classic-qa-1",
        "question": "被女巫毒殺的獵人可以開槍嗎？",
        "answer": "不能開槍。獵人僅在被狼人刀出局或白天被放逐出局時才能開槍。",
        "relatedRoleIds": [
          "hunter",
          "witch"
        ]
      },
      {
        "id": "classic-qa-2",
        "question": "白痴白天被放逐翻牌免死後，狼人還需要追刀白痴才能屠神嗎？",
        "answer": "依本局「白痴追刀」開關決定：預設不用追刀（其餘神職全滅即判屠神）；若開啟追刀則白痴仍算存活神職。",
        "relatedRoleIds": [
          "idiot"
        ]
      },
      {
        "id": "classic-qa-3",
        "question": "女巫同一晚可以同時使用解藥和毒藥嗎？",
        "answer": "不行，解藥與毒藥不可在同一晚使用。",
        "relatedRoleIds": [
          "witch"
        ]
      },
      {
        "id": "classic-qa-4",
        "question": "狼人白天自爆後什麼時候正式死亡？",
        "answer": "狼人白天自爆會強制進入夜晚，並在當晚完成點刀後才正式死亡。",
        "relatedRoleIds": [
          "wolf"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "idiotNeedsExtraKill",
      "wolfKillPriority"
    ]
  },
  {
    "id": "12p-wolf-king-guard",
    "name": "12 人局 - 狼王守衛",
    "playerCount": 12,
    "playerCountFilter": "12",
    "keywords": [
      "狼王守衛",
      "黑狼王",
      "狼王",
      "守衛",
      "預女獵守",
      "奶穿",
      "12人"
    ],
    "automationLevel": "full",
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 3
        },
        {
          "roleId": "wolf_king",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "seer",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "hunter",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼",
          "judgeTips": [
            "不可連續兩晚守護同一名玩家；可空守或自守；守衛僅防狼刀不防毒。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人(狼王)",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "小狼與狼王共同睜眼點刀，可空刀或自刀。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "同守同救將觸發「奶穿」導致目標死亡。",
            "解藥與毒藥不可同一晚使用；毒殺狼王或獵人可使其無法開槍。"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼",
          "judgeTips": [
            "被狼刀、奶穿、狼王開槍或放逐皆可開槍；被女巫毒殺不可開槍。"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼",
          "judgeTips": [
            "不可連續兩晚守護同一名玩家；可空守或自守；守衛僅防狼刀不防毒。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人(狼王)",
          "actorRoleIds": [
            "wolf",
            "wolf_king"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "小狼與狼王共同睜眼點刀，可空刀或自刀。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "同守同救將觸發「奶穿」導致目標死亡。",
            "解藥與毒藥不可同一晚使用；毒殺狼王或獵人可使其無法開槍。"
          ]
        },
        {
          "stepId": "seer_check",
          "actorLabel": "預言家",
          "actorRoleIds": [
            "seer"
          ],
          "actionType": "seer_check",
          "openPrompt": "預言家請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "預言家請閉眼"
        },
        {
          "stepId": "hunter_gesture",
          "actorLabel": "獵人",
          "actorRoleIds": [
            "hunter"
          ],
          "actionType": "hunter_gesture",
          "openPrompt": "獵人請睜眼",
          "actionPrompt": "今晚的開槍手勢是...",
          "closePrompt": "獵人請閉眼",
          "judgeTips": [
            "被狼刀、奶穿、狼王開槍或放逐皆可開槍；被女巫毒殺不可開槍。"
          ]
        }
      ]
    },
    "qaList": [
      {
        "id": "wkg-qa-1",
        "question": "什麼是「同守同救奶穿」？",
        "answer": "若夜間狼人刀殺某位玩家，且守衛守護與女巫解藥同時作用於同一名玩家，會導致該玩家死亡。",
        "relatedRoleIds": [
          "guard",
          "witch"
        ]
      },
      {
        "id": "wkg-qa-2",
        "question": "守衛可以擋住女巫的毒藥嗎？",
        "answer": "不行，普通守衛的盾只能防狼刀，無法擋住女巫毒藥。",
        "relatedRoleIds": [
          "guard",
          "witch"
        ]
      },
      {
        "id": "wkg-qa-3",
        "question": "狼王在哪些情況下可以開槍？哪些情況不能？",
        "answer": "自刀死亡、被獵人開槍、被奶穿或白天被放逐出局時可開槍；但若被女巫毒殺、白天自爆或作為最後一隻狼出局則無法開槍。",
        "relatedRoleIds": [
          "wolf_king",
          "hunter",
          "witch"
        ]
      },
      {
        "id": "wkg-qa-4",
        "question": "什麼是「狼刀在先」？",
        "answer": "若當晚狼刀已達成屠民或屠神條件，即使同晚女巫毒殺最後一隻狼，仍判定狼人陣營勝利。",
        "relatedRoleIds": [
          "wolf",
          "wolf_king",
          "witch"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "wolfKillPriority"
    ]
  },
  {
    "id": "10p-mech-wolf-psychic",
    "name": "10 人局 - 機械狼通靈師 / 鏡隱迷蹤",
    "playerCount": 10,
    "playerCountFilter": "10",
    "keywords": [
      "機械狼",
      "覺醒隱狼",
      "通靈師",
      "魔鏡少女",
      "鏡隱迷蹤",
      "10人"
    ],
    "automationLevel": "full",
    "composition": {
      "wolf": [
        {
          "roleId": "wolf",
          "count": 2
        },
        {
          "roleId": "mech_wolf",
          "count": 1
        }
      ],
      "good": [
        {
          "roleId": "villager",
          "count": 4
        },
        {
          "roleId": "psychic",
          "count": 1
        },
        {
          "roleId": "witch",
          "count": 1
        },
        {
          "roleId": "guard",
          "count": 1
        }
      ]
    },
    "nightSchedule": {
      "firstNight": [
        {
          "stepId": "mech_wolf_learn",
          "actorLabel": "機械狼",
          "actorRoleIds": [
            "mech_wolf"
          ],
          "actionType": "mech_wolf_learn",
          "openPrompt": "機械狼請睜眼",
          "actionPrompt": "請選擇要學習的對象",
          "closePrompt": "機械狼請閉眼",
          "judgeTips": [
            "不可學習自己；若開啟首夜強制學習開關則不可跳過。"
          ]
        },
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼",
          "judgeTips": [
            "不可連續兩晚守護同一人；普通守衛之盾無法擋毒。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "首夜僅小狼睜眼，機械狼尚未入隊。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "同守同救會觸發奶穿；解藥與毒藥不可同晚使用。"
          ]
        },
        {
          "stepId": "psychic_check",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "psychic_check",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "通靈師請閉眼",
          "judgeTips": [
            "機械狼學習前查驗為「機械狼」，學習後查驗顯示其所學對象的真實身分。"
          ]
        },
        {
          "stepId": "mech_wolf_reveal_skill",
          "actorLabel": "機械狼",
          "actorRoleIds": [
            "mech_wolf"
          ],
          "actionType": "mech_wolf_reveal_skill",
          "openPrompt": "機械狼請睜眼",
          "actionPrompt": "你學習到的技能為...",
          "closePrompt": "機械狼請閉眼",
          "judgeTips": [
            "告知機械狼學到的角色技能，自第二晚起生效。"
          ]
        }
      ],
      "subsequentNights": [
        {
          "stepId": "guard_protect",
          "actorLabel": "守衛",
          "actorRoleIds": [
            "guard"
          ],
          "actionType": "guard_protect",
          "openPrompt": "守衛請睜眼",
          "actionPrompt": "請選擇要守護的玩家",
          "closePrompt": "守衛請閉眼",
          "judgeTips": [
            "不可連續兩晚守護同一名玩家。"
          ]
        },
        {
          "stepId": "mech_wolf_night_action",
          "actorLabel": "機械狼",
          "actorRoleIds": [
            "mech_wolf"
          ],
          "actionType": "mech_wolf_night_action",
          "openPrompt": "機械狼請睜眼",
          "actionPrompt": "今晚的入隊手勢為...\n請問你要使用技能嗎？",
          "closePrompt": "機械狼請閉眼",
          "judgeTips": [
            "所有小狼皆淘汰後比出已入隊手勢並解鎖狼刀（若學到小狼則同時解鎖雙刀）。",
            "學女巫僅 1 瓶毒；學守衛之機械盾可擋女巫毒藥且不可連守。"
          ]
        },
        {
          "stepId": "wolf_kill",
          "actorLabel": "狼人",
          "actorRoleIds": [
            "wolf",
            "mech_wolf"
          ],
          "actionType": "wolf_kill",
          "openPrompt": "狼人請睜眼",
          "actionPrompt": "請選擇要擊殺的目標",
          "closePrompt": "狼人請閉眼",
          "judgeTips": [
            "機械狼僅在所有小狼皆出局入隊後才參與本步驟點刀。"
          ]
        },
        {
          "stepId": "witch_action",
          "actorLabel": "女巫",
          "actorRoleIds": [
            "witch"
          ],
          "actionType": "witch_action",
          "openPrompt": "女巫請睜眼",
          "actionPrompt": "昨晚他被殺死了，你要使用解藥嗎？\n你要使用毒藥嗎？你要毒誰呢？",
          "closePrompt": "女巫請閉眼",
          "judgeTips": [
            "注意機械狼若學守衛，其機械盾可以擋住女巫的毒藥。"
          ]
        },
        {
          "stepId": "psychic_check",
          "actorLabel": "通靈師",
          "actorRoleIds": [
            "psychic"
          ],
          "actionType": "psychic_check",
          "openPrompt": "通靈師請睜眼",
          "actionPrompt": "請選擇要查驗的玩家，他的身分是...",
          "closePrompt": "通靈師請閉眼",
          "judgeTips": [
            "查驗存活玩家真實身分；已學習之機械狼顯示其所學角色身分。"
          ]
        }
      ]
    },
    "qaList": [
      {
        "id": "mwp-qa-1",
        "question": "通靈師查驗機械狼會看到什麼身分？",
        "answer": "機械狼尚未學習前會查驗為「機械狼」；學習後則動態顯示其所學習對象的真實身分。",
        "relatedRoleIds": [
          "mech_wolf",
          "psychic"
        ]
      },
      {
        "id": "mwp-qa-2",
        "question": "機械狼學到女巫、守衛、小狼各有什麼特殊規則？",
        "answer": "學女巫僅獲得 1 瓶毒藥（無解藥）；學守衛的機械盾可以擋住女巫毒藥（仍不可連守）；學小狼的額外一刀須等所有小狼皆出局入隊後才能開啟（形成雙刀）。",
        "relatedRoleIds": [
          "mech_wolf",
          "witch",
          "guard",
          "wolf"
        ]
      },
      {
        "id": "mwp-qa-3",
        "question": "機械狼可以自爆嗎？什麼時候入狼隊？",
        "answer": "機械狼全程不可自爆，初期不入狼隊；當場上所有小狼皆淘汰且機械狼仍存活時，自動入隊並解鎖狼刀。",
        "relatedRoleIds": [
          "mech_wolf",
          "wolf"
        ]
      },
      {
        "id": "mwp-qa-4",
        "question": "小狼全部出局後好人就贏了嗎？",
        "answer": "不是，機械狼屬於狼人陣營，好人須淘汰所有小狼與機械狼方能獲勝。",
        "relatedRoleIds": [
          "mech_wolf"
        ]
      }
    ],
    "supportedRuleToggles": [
      "witchSelfSave",
      "mechWolfForceLearnNight1",
      "wolfKillPriority"
    ]
  }
];

export const BOARDS_BY_ID: Record<string, BoardDefinition> = Object.fromEntries(
  ALL_BOARDS.map((board) => [board.id, board]),
);

export function getBoardById(boardId: string | null): BoardDefinition | undefined {
  if (!boardId) return undefined;
  return BOARDS_BY_ID[boardId];
}

export function filterBoards(
  boards: BoardDefinition[],
  countFilter: PlayerCountFilter | 'all',
  query: string,
): BoardDefinition[] {
  const normalizedQuery = query.trim().toLowerCase();
  return boards.filter((board) => {
    if (countFilter !== 'all' && board.playerCountFilter !== countFilter) {
      return false;
    }
    if (!normalizedQuery) return true;
    const haystack = [board.name, ...board.keywords].join(' ').toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}
