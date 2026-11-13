// Each grip is measured from the model origin. Turn is the resting angle in the hand.
export const weaponGrips={
  tiger:{anchor:[.16,.09,0],turn:-.36,pitch:-.22,scale:.92},
  dragon:{anchor:[0,-.32,0],turn:.15,pitch:-.12,scale:.88},
  phoenix:{anchor:[0,-.41,0],turn:-.67,pitch:-.22,scale:.96},
  turtle:{anchor:[0,-.30,0],turn:.32,pitch:-.19,scale:.94},
  qilin:{anchor:[0,-.27,0],turn:-.45,pitch:-.19,scale:1.02},
  flameblade:{anchor:[0,-.59,0],turn:-.72,pitch:-.32,scale:1.03},
  stormbow:{anchor:[-.18,0,0],turn:.19,pitch:-.11,scale:1.01},
  windhalberd:{anchor:[0,-.36,0],turn:-.48,pitch:-.19,scale:.97},
  frostlute:{anchor:[0,.31,.05],turn:.61,pitch:-.10,scale:.96,hand:1},
  chakra:{anchor:[-.34,.04,0],turn:-.18,pitch:-.23,scale:.94},
  reaper:{anchor:[0,-.30,0],turn:-.32,pitch:-.26,scale:.94},
  bell:{anchor:[0,-.31,0],turn:.38,pitch:-.20,scale:1.02},
  fangs:{anchor:[0,-.37,0],turn:-.62,pitch:-.26,scale:.90},
  cannon:{anchor:[-.11,-.40,0],turn:-1.14,pitch:-.55,scale:1.0},
};

// Coordinates are in the cropped frame, relative to its centre, with positive y upward.
export const pawPositions={
  0:[[.414,-.115],[.004,-.105]],
  1:[[.304,-.154],[-.108,-.015]],
  2:[[.395,.217],[-.151,-.018]],
  40:[[.323,.193],[.242,.008]],
};
