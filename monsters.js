// Function to determine the current quarter and adjust health
function adjustHealthByQuarter(baseHealth) {
  const currentMonth = new Date().getMonth() + 1; // getMonth() is zero-based
  let quarterMultiplier = 0;

  if (currentMonth >= 1 && currentMonth <= 3) {
    quarterMultiplier = 0; // Q1
  } else if (currentMonth >= 4 && currentMonth <= 6) {
    quarterMultiplier = 1; // Q2
  } else if (currentMonth >= 7 && currentMonth <= 9) {
    quarterMultiplier = 2; // Q3
  } else if (currentMonth >= 10 && currentMonth <= 12) {
    quarterMultiplier = 3; // Q4
  }

  return baseHealth + (quarterMultiplier * 200);
}

// New helper: selects a random dialogue if an array
function selectDialogue(dialogue) {
  return Array.isArray(dialogue) ? dialogue[Math.floor(Math.random() * dialogue.length)] : dialogue;
}

window.monsters = [
  {
    name: "-Enemy Select-",
    attackType: "",
    health: adjustHealthByQuarter(0),
    hitNumbers: [0, 0, 0, 0, 0],
    imageSrc: "",
    defeatedImageSrc: "",
    // No dialogues needed for the dummy object.
    toggleDialogues: {
      player1: ["No toggle dialogue."],
      player2: ["No toggle dialogue."]
    }
  },
  {
    name: "EtchWraith Swarm",
    attackType: "Swarm",
    health: adjustHealthByQuarter(400),
    hitNumbers: [ 5, 19, 4, 1, 8, 12, 5, 3, 6, 17],
    Rewards: "Spinner gets to pick any available CO-OP game instead of spinning. Player also gains 50 ducats and a random weapon. ",
    Punishment:"Spinner Deletes 4 spin options. No CO-OP game will be picked this week. ",
    imageSrc: "https://i.ibb.co/hF64f021/Ergobugs-Ergo-Villian.jpg",
    defeatedImageSrc: "https://static.vecteezy.com/system/resources/thumbnails/023/122/996/small/skull-with-roses-human-skull-in-beautiful-flowers-halloween-images-day-of-the-dead-generative-ai-photo.jpg",
    damageDialogues: {
      zero: [
        "EtchWraith Swarm dodge around your fist and buzz in defiance.",
        "The EtchWraith Swarm's form flickers and distorts, but it quickly reassembles!",
        "More EtchWraiths join the fray, but the remains undeterred.",
        "Some of these fucking bugs sound like they're laughing at you as you miss.",
        "As you swing, the EtchWraith Swarm splits apart and reforms, avoiding the hit.",
        "",
        "EtchWraith Swarm ignores the minor scratch.",
        "EtchWraith Swarm barely registers the hit."],
      "1-20": [
        "EtchWraith Swarm winces at the hit.",
        "buz buzz",
        "One of the bugs falls to the ground, but the rest keep coming.",
        "two bugs crash into each other, some of the EtchWraiths strart to eat the carcasses.",

        "buzzing in pain, EtchWraith Swarm recoils from the hit."
      ],
      "21-35": [
        "Sparks fly from the EtchWraith Swarm as it recoils from the blow!",
        "EtchWraith Swarm grunts from the moderate blow."],
      "36-75": [
        "You take out 4 bugs with one swing! Their bodies fall to the ground with a thud.",
        "A mighty strike! EtchWraith Swarm roars in agony!"],
      "76-99": [
        "As the Swarm decends upon you, you strike them back with a powerful blow! bug legs and metalic wings fly everywhere!",
        "Your attack causes an explosion of bug parts! some of the EtchWraiths rush in to pick at the remains before darting at you again.",
        "The hit shakes EtchWraith Swarm deeply!"],
      "100+": [
        "You are fucking them up! EtchWraith Swarm buzzes in terror!",
        "A devastating blow! EtchWraith Swarm staggers."]
    },
    hitDialogues: {
      "1": [
        "The EtchWraith Swarm flys by you causing knicks and bruises as you fight them off.",
        "The EtchWraith Swarm lands a single, precise hit."], 
      "2-3": [
        "EtchWraith Swarm delivers quick successive blows!",
        "Fucking ergobugs spit acid on your armor! Life support systems are failing!",
        "You can't keep up with the EtchWraith Swarm's relentless assault!",
      ],
      "4-5": [
        "EtchWraith Swarm's furious assault shows no mercy!",
        "You are surrounded! These things are everywhere!",
        "A barrage! EtchWraith Swarm overwhelms the attacker!"],
      "6-9": [
        "A mountain of bugs swarm you! All you can do is swing and hope to hit something as the !",
        "EtchWraith Swarm’s furious assault shows no mercy!"],
      "10+": [
        "A relentless barrage decimates the foe!"]
    },
    getDamageDialogue(damage, playerName) {
      if (damage === 0) return selectDialogue(this.damageDialogues.zero);
      if (damage >= 1 && damage <= 20) return selectDialogue(this.damageDialogues["1-20"]);
      if (damage >= 21 && damage <= 35) return selectDialogue(this.damageDialogues["21-35"]);
      if (damage >= 36 && damage <= 75) return selectDialogue(this.damageDialogues["36-75"]);
      if (damage >= 76 && damage <= 99) return selectDialogue(this.damageDialogues["76-99"]);
      if (damage >= 100) return selectDialogue(this.damageDialogues["100+"]);
      return "";
    },
    getHitDialogue(hitCount, playerName) {
      if (hitCount === 1) return selectDialogue(this.hitDialogues["1"]);
      if (hitCount >= 2 && hitCount <= 3) return selectDialogue(this.hitDialogues["2-3"]);
      if (hitCount >= 4 && hitCount <= 5) return selectDialogue(this.hitDialogues["4-5"]);
      if (hitCount >= 6 && hitCount <= 9) return selectDialogue(this.hitDialogues["6-9"]);
      if (hitCount >= 10) return selectDialogue(this.hitDialogues["10+"]);
      return "";
    },
    About:"The EtchWraith Swarm is a group of ErgoBugs that have banded together to form a formidable force. They are known for their relentless attacks and their ability to overwhelm their foes. The EtchWraith Swarm is a force to be reckoned with, and only the bravest and strongest adventurers dare to face them in battle." ,
    toggleDialogues: {
      player1: [
        "EtchWraith Swarm says: Ready for action, Jaybers8?",
        "EtchWraith Swarm roars: Your move, Jaybers8!"
      ],
      player2: [
        "EtchWraith Swarm says: Ready for action, FLIGHTx12!",
        "EtchWraith Swarm roars: Your move, FLIGHTx12!"
      ]
    }
  },
  {
    name: "CyberBadger Cete",
    attackType: "OverWhelm",
    health: adjustHealthByQuarter(500),
    hitNumbers: [15, 6, 6, 6, 4, 8, 9, 12, 2, 20 ],
    Rewards: "Spinner gets to pick any available PVP game instead of spinning.",
    Punishment:"Spinner deletes 2 spin options and 2 weekday “FUN” events. Spin again unless PVP has been removed. ",
    imageSrc: "https://i.ibb.co/XrMg0sFn/Ergo-Badgers-Ergo-Villian.jpg",
    defeatedImageSrc: "https://static.vecteezy.com/system/resources/thumbnails/023/122/996/small/skull-with-roses-human-skull-in-beautiful-flowers-halloween-images-day-of-the-dead-generative-ai-photo.jpg",
    damageDialogues: {
      zero: [
        "The CyberBadger Clan dodges the hit.",
        "The CyberBadger Swarm cackles and laughs as you swing and slip in some cyber shit! 💩 .",
        "CyberBadger Swarm ignores the minor scratch."],
      "1-20": [
        "A light jab makes CyberBadgers scatter.",
        "You graze one as three rush at you barking ferociously",
      ],
      "21-35": [
        "You kick a badger in its stomach, it goes flying into a group of badgers charging you",
        "CyberBadgers growls at the hit."],
      "36-75": [
        "A solid strike! CyberBadger Cete snarls in pain!"],
      "76-99": [
        "The force rattles CyberBadger Clan noticeably! A few scurry off."],
      "100+": [
        "A crushing blow! The CyberBadgers waver. Thier green blood paints the battlefield"]
    },
    hitDialogues: {
      "1": [
        "CyberBadger Swarm scores a sharp hit."],
      "2-3": [
        "CyberBadger Swarm strikes twice in quick succession!"],
      "4-5": [
        "A flurry of hits from CyberBadger Swarm!"],
      "6-9": [
        "CyberBadger Swarm's relentless assault is terrifying!"],
      "10+": [
        "💥💥 4 CyberBadgers explode in your face! They have self destructable armor? WHAT THE FUCK!",
        "A CyberBadger badger is tired of your shit and takes a hunk out of your arm!",
        "A barrage from CyberBadger Swarm leaves devastation!"]
    },
    getDamageDialogue(damage, playerName) {
      if (damage === 0) return selectDialogue(this.damageDialogues.zero);
      if (damage >= 1 && damage <= 20) return selectDialogue(this.damageDialogues["1-20"]);
      if (damage >= 21 && damage <= 35) return selectDialogue(this.damageDialogues["21-35"]);
      if (damage >= 36 && damage <= 75) return selectDialogue(this.damageDialogues["36-75"]);
      if (damage >= 76 && damage <= 99) return selectDialogue(this.damageDialogues["76-99"]);
      if (damage >= 100) return selectDialogue(this.damageDialogues["100+"]);
      return "";
    },
    getHitDialogue(hitCount, playerName) {
      if (hitCount === 1) return selectDialogue(this.hitDialogues["1"]);
      if (hitCount >= 2 && hitCount <= 3) return selectDialogue(this.hitDialogues["2-3"]);
      if (hitCount >= 4 && hitCount <= 5) return selectDialogue(this.hitDialogues["4-5"]);
      if (hitCount >= 6 && hitCount <= 9) return selectDialogue(this.hitDialogues["6-9"]);
      if (hitCount >= 10) return selectDialogue(this.hitDialogues["10+"]);
      return "";
    },
    About:"The CyberBadger Cete is a group of ErgoBadgers that have banded together to form a formidable force. They are known for their relentless attacks and their ability to overwhelm their foes. The CyberBadger Cete is a force to be reckoned with, and only the bravest and strongest adventurers dare to face them in battle." ,
    toggleDialogues: {
      player1: [
        "The CyberBadger Cete snarls at Jaybers8!",
        "The CyberBadger Clan bark loudly and charge at Jaybers8!"
      ],
      player2: [
        "CyberBadger Cete snarls: Bring it on, FLIGHTx12!",
        "The CyberBadger Clan bark loudly and charge at FLIGHTx12"
      ]
    }
  },
  {
    name: "Forbearer-Ramis",
    attackType: "CONSTITUTION",
    health: adjustHealthByQuarter(1205),
    hitNumbers: [15, 6,  4, 20, 20, 20],
    Rewards:"Spinner gets to pick any available PVP game instead of spinning. Player also gains 50 ducats and a random weapon. ",
    Punishment:"Spinner Deletes 2 spin options and 2 weekday “FUN” events (can not be PvP). No PvP game will be picked this week. ",
    imageSrc: "https://i.ibb.co/JWj2G6mp/Forbearer-Ramis-Ergo-Villian.jpg",
    defeatedImageSrc: "https://static.vecteezy.com/system/resources/thumbnails/023/122/996/small/skull-with-roses-human-skull-in-beautiful-flowers-halloween-images-day-of-the-dead-generative-ai-photo.jpg",
    damageDialogues: {
      zero: [
        "Forbearer-Ramis shrugs off the hit."],
      "1-20": [
        "Forbearer-Ramis takes a light hit."],
      "21-35": [
        "Forbearer-Ramis grunts from the blow."],
      "36-75": [
        "A strong hit! Forbearer-Ramis feels the impact!"],
      "76-99": [
        "You dodge Ramis's attack spin behind him before striking him in the back!",
        "You knee Ramis in the face! He stumbles back and lands on his ass",
        "Forbearer-Ramis is shaken by the force!"],
      "100+": [
        "A powerful strike! Forbearer-Ramis staggers."]
    },
    hitDialogues: {
      "1": [
        "Ramis throws dirt in your eyes, when you recover he is nowhere to be seen",
        "Forbearer-Ramis lands a precise hit.'I train for this bitch!' "],
      "2-3": [
        "Forbearer-Ramis strikes twice in quick succession!"],
      "4-5": [
        "A series of hits from Forbearer-Ramis!"],
      "6-9": [
        "Forbearer-Ramis's relentless assault is fierce!"],
      "10+": [
        "A devastating barrage from Forbearer-Ramis!"]
    },
    getDamageDialogue(damage, playerName) {
      if (damage === 0) return selectDialogue(this.damageDialogues.zero);
      if (damage >= 1 && damage <= 20) return selectDialogue(this.damageDialogues["1-20"]);
      if (damage >= 21 && damage <= 35) return selectDialogue(this.damageDialogues["21-35"]);
      if (damage >= 36 && damage <= 75) return selectDialogue(this.damageDialogues["36-75"]);
      if (damage >= 76 && damage <= 99) return selectDialogue(this.damageDialogues["76-99"]);
      if (damage >= 100) return selectDialogue(this.damageDialogues["100+"]);
      return "";
    },
    getHitDialogue(hitCount, playerName) {
      if (hitCount === 1) return selectDialogue(this.hitDialogues["1"]);
      if (hitCount >= 2 && hitCount <= 3) return selectDialogue(this.hitDialogues["2-3"]);
      if (hitCount >= 4 && hitCount <= 5) return selectDialogue(this.hitDialogues["4-5"]);
      if (hitCount >= 6 && hitCount <= 9) return selectDialogue(this.hitDialogues["6-9"]);
      if (hitCount >= 10) return selectDialogue(this.hitDialogues["10+"]);
      return "";
    },
    About:"The Forbearer-Ramis is in battle." ,
    toggleDialogues: {
      player1: [
        "Forbearer-Ramis grunts: Stand your ground, Jaybers8!",
        "Forbearer-Ramis calls: Now toggle and face me, Jaybers8!"
      ],
      player2: [
        "Forbearer-Ramis grunts: Stand your ground, FLIGHTx12!",
        "Forbearer-Ramis calls: Now toggle and face me, FLIGHTx12!"
      ]
    }
  },
  {
    name: "PURSCERx17",
    attackType: "STRENGTH",
    health: adjustHealthByQuarter(900),
    hitNumbers: [17, 17, 17, 17, 17, 17, 1, 1, 8, 8, 12, 5, 5,],
    Rewards:"Spinner gets to pick any available PVP game instead of spinning. Player also gains 50 ducats and a random weapon. ",
    Punishment:"Spinner Deletes 2 spin options and 2 weekday “FUN” events (can not be PvP). No PvP game will be picked this week.",
    imageSrc: "https://i.ibb.co/mFDZz1p3/PURSCERx17-Ergo-Villian.jpg",
    defeatedImageSrc: "https://static.vecteezy.com/system/resources/thumbnails/023/122/996/small/skull-with-roses-human-skull-in-beautiful-flowers-halloween-images-day-of-the-dead-generative-ai-photo.jpg",
    damageDialogues: {
      zero: [
        "PURSCERx17 steps to the side avoiding your attack 'Thats what you wrokin with pussy?'.",
        "PURSCERx17 is unfazed by the hit.",
        "PURSCERx17 shrugs off the hit",
        " You missed PURSCERx17! 'The fuck was that shorty?",
        ],
      "1-20": [
        "PURSCERx17 takes a minor hit."],
      "21-35": [
        "PURSCERx17 grunts from the blow."],
      "36-75": [
        "A solid hit! PURSCERx17 feels the impact!"],
      "76-99": [
        "PURSCERx17 is shaken by the force!"],
      "100+": [
        "A powerful strike! PURSCERx17 staggers."]
    },
    hitDialogues: {
      "1": [
        "PURSCERx17 lands a precise hit.",
        "PURSCERx17's attack is a swift jab",
        "PURSCERx17's metal armor clanks against yours as he pushes you back with his forarm",
        "PURSCERx17 roars in your direction leaving you shaken from the intensity. 'I'm gonna crush your bitch ass!'"],
      "2-3": [
        "PURSCERx17 give you a 2 peice with wings to your gut! You hop back in fear of his next swing",
        "PURSCERx17 Walks up slowely, tanking your attacks. Suddenly he smacks the shit outta you! Blood drips from your mouth. You face feels swollen ",
        "PURSCERx17 strikes twice in quick succession!"],
      "4-5": [
        "A series of hits from PURSCERx17!"],
      "6-9": [
        "PURSCERx17's relentless assault is fierce!",
        "PURSCER uppercuts you and you land 10ft away. Your shoulder and back feel numb. "
      ],
      "10+": [
        "A devastating barrage from PURSCERx17!"]
    },
    getDamageDialogue(damage, playerName) {
      if (damage === 0) return selectDialogue(this.damageDialogues.zero);
      if (damage >= 1 && damage <= 20) return selectDialogue(this.damageDialogues["1-20"]);
      if (damage >= 21 && damage <= 35) return selectDialogue(this.damageDialogues["21-35"]);
      if (damage >= 36 && damage <= 75) return selectDialogue(this.damageDialogues["36-75"]);
      if (damage >= 76 && damage <= 99) return selectDialogue(this.damageDialogues["76-99"]);
      if (damage >= 100) return selectDialogue(this.damageDialogues["100+"]);
      return "";
    },
    getHitDialogue(hitCount, playerName) {
      if (hitCount === 1) return selectDialogue(this.hitDialogues["1"]);
      if (hitCount >= 2 && hitCount <= 3) return selectDialogue(this.hitDialogues["2-3"]);
      if (hitCount >= 4 && hitCount <= 5) return selectDialogue(this.hitDialogues["4-5"]);
      if (hitCount >= 6 && hitCount <= 9) return selectDialogue(this.hitDialogues["6-9"]);
      if (hitCount >= 10) return selectDialogue(this.hitDialogues["10+"]);
      return "";
    },
    About:"The PURSCERx17 is in battle." ,
    toggleDialogues: {
      player1: [
        "PURSCERx17 shouts: Get ready, Jaybers8!",
        "PURSCERx17 warns: Switching now, Jaybers8!"
      ],
      player2: [
        "PURSCERx17 shouts: Get ready, FLIGHTx12!",
        "PURSCERx17 warns: Switching now, FLIGHTx12!"
      ]
    }
  },
  {
    name: "Aphen Neel",
    attackType: "INTELLINGENCE",
    health: adjustHealthByQuarter(580),
    hitNumbers: [16, 6, 6, 6, 7, 19, 3, 3, 14],
    Rewards:"Spinner gets to pick any available PVP game instead of spinning. Player also gains 50 ducats and a random weapon. ",
    Punishment:"Spinner Deletes 2 spin options and 2 weekday “FUN” events (can not be PvP). No PvP game will be picked this week. ",
    imageSrc: "https://i.ibb.co/rGgXk56y/Aphen-Neel-Ergo-Villian.jpg",
    defeatedImageSrc: "https://static.vecteezy.com/system/resources/thumbnails/023/122/996/small/skull-with-roses-human-skull-in-beautiful-flowers-halloween-images-day-of-the-dead-generative-ai-photo.jpg",
    damageDialogues: {
      zero: [
        "Aphen Neel shrugs off the hit."],
      "1-20": [
        "Aphen Neel takes a light hit."],
      "21-35": [
        "Aphen Neel grunts from the blow."],
      "36-75": [
        "A strong hit! Aphen Neel feels the impact!"],
      "76-99": [
        "Aphen Neel is shaken by the force!"],
      "100+": [
        "A powerful strike! Aphen Neel staggers."]
    },
    hitDialogues: {
      "1": [
        "Aphen Neel lands a precise hit.",
        "Aphen Neel launches a purple dagger of light in your direction, She looks confused and obviously thought it would have done more harm."],
      "2-3": [
        "Aphen Neel strikes twice in quick succession!"],
      "4-5": [
        "A series of hits from Aphen Neel!"],
      "6-9": [
        "Aphen Neel's relentless assault is fierce!"],
      "10+": [
        "A devastating barrage from Aphen Neel!"]
    },
    getDamageDialogue(damage, playerName) {
      if (damage === 0) return selectDialogue(this.damageDialogues.zero);
      if (damage >= 1 && damage <= 20) return selectDialogue(this.damageDialogues["1-20"]);
      if (damage >= 21 && damage <= 35) return selectDialogue(this.damageDialogues["21-35"]);
      if (damage >= 36 && damage <= 75) return selectDialogue(this.damageDialogues["36-75"]);
      if (damage >= 76 && damage <= 99) return selectDialogue(this.damageDialogues["76-99"]);
      if (damage >= 100) return selectDialogue(this.damageDialogues["100+"]);
      return "";
      },
    getHitDialogue(hitCount, playerName) {
      if (hitCount === 1) return selectDialogue(this.hitDialogues["1"]);
      if (hitCount >= 2 && hitCount <= 3) return selectDialogue(this.hitDialogues["2-3"]);
      if (hitCount >= 4 && hitCount <= 5) return selectDialogue(this.hitDialogues["4-5"]);
      if (hitCount >= 6 && hitCount <= 9) return selectDialogue(this.hitDialogues["6-9"]);
      if (hitCount >= 10) return selectDialogue(this.hitDialogues["10+"]);
      return "";
    },
    About:"The Aphen Neel is in battle." ,
    toggleDialogues: {
      player1: [
        "Aphen Neel whispers: Welcome, Jaybers8.",
        "Aphen Neel murmurs: Let the battle begin for you, Jaybers8."
      ],
      player2: [
        "Aphen Neel whispers: Welcome, FLIGHTx12.",
        "Aphen Neel murmurs: Let the battle begin for you, FLIGHTx12."
      ]
    }
  },
  {
    name: "Curve",
    attackType: "PERCEPTION",
    health: adjustHealthByQuarter(612),
    hitNumbers: [1, 2, 3, 4, 5],
    Rewards:"Spinner gets to pick any available PVP game instead of spinning. Player also gains 50 ducats and a random weapon. ",
    Punishment:"Spinner Deletes 2 spin options and 2 weekday “FUN” events (can not be PvP). No PvP game will be picked this week. ",
    imageSrc: "https://i.ibb.co/6JB8WQ2g/Curve-Ergo-Villian.jpg",
    defeatedImageSrc: "https://static.vecteezy.com/system/resources/thumbnails/023/122/996/small/skull-with-roses-human-skull-in-beautiful-flowers-halloween-images-day-of-the-dead-generative-ai-photo.jpg",
    damageDialogues: {
      zero: [
        "Curve shrugs off the hit."],
      "1-20": [
        "Curve takes a light hit."],
      "21-35": [
        "Curve grunts from the blow."],
      "36-75": [
        "A strong hit! Curve feels the impact!"],
      "76-99": [
        "Curve is shaken by the force!"],
      "100+": [
        "A powerful strike! Curve staggers."]
    },
    hitDialogues: {
      "1": [
        "Curve lands a precise hit."],
      "2-3": [
        "Curve strikes twice in quick succession!"],
      "4-5": [
        "A series of hits from Curve!"],
      "6-9": [
        "Curve's relentless assault is fierce!"],
      "10+": [
        "A devastating barrage from Curve!"]
    },
    getDamageDialogue(damage, playerName) {
      if (damage === 0) return selectDialogue(this.damageDialogues.zero);
      if (damage >= 1 && damage <= 20) return selectDialogue(this.damageDialogues["1-20"]);
      if (damage >= 21 && damage <= 35) return selectDialogue(this.damageDialogues["21-35"]);
      if (damage >= 36 && damage <= 75) return selectDialogue(this.damageDialogues["36-75"]);
      if (damage >= 76 && damage <= 99) return selectDialogue(this.damageDialogues["76-99"]);
      if (damage >= 100) return selectDialogue(this.damageDialogues["100+"]);
      return "";
    },
    getHitDialogue(hitCount, playerName) {
      if (hitCount === 1) return selectDialogue(this.hitDialogues["1"]);
      if (hitCount >= 2 && hitCount <= 3) return selectDialogue(this.hitDialogues["2-3"]);
      if (hitCount >= 4 && hitCount <= 5) return selectDialogue(this.hitDialogues["4-5"]);
      if (hitCount >= 6 && hitCount <= 9) return selectDialogue(this.hitDialogues["6-9"]);
      if (hitCount >= 10) return selectDialogue(this.hitDialogues["10+"]);
      return "";
    },
    About:"The Curve is in battle." ,
    toggleDialogues: {
      player1: [
        "Curve tilts: Step in, Jaybers8!",
        "Curve exclaims: Your toggle time is now, Jaybers8!"
      ],
      player2: [
        "Curve tilts: Step in, FLIGHTx12!",
        "Curve exclaims: Your toggle time is now, FLIGHTx12!"
      ]
    }
  },
  {
    name: "Dulguun Bolor",
    attackType: "CONSTITUTION",
    health: adjustHealthByQuarter(1610),
    hitNumbers: [2, 11, 19, 13, 13],
    Rewards:"Spinner gets to pick any available CO-OP game instead of spinning. Player also gains 50 ducats and a random weapon. ",
    Punishment:"Spinner Deletes 4 spin options. No CO-OP game will be picked this week. ",
    imageSrc: "https://i.ibb.co/j9PBJZdy/Dulguun-Bolor-Ergo-Villian.jpg",
    defeatedImageSrc: "https://static.vecteezy.com/system/resources/thumbnails/023/122/996/small/skull-with-roses-human-skull-in-beautiful-flowers-halloween-images-day-of-the-dead-generative-ai-photo.jpg",
    damageDialogues: {
      zero: [
        "Dulguun Bolor shrugs off the hit."],
      "1-20": [
        "Dulguun Bolor takes a light hit."],
      "21-35": [
        "Dulguun Bolor grunts from the blow."],
      "36-75": [
        "A strong hit! Dulguun Bolor feels the impact!"],
      "76-99": [
        "Dulguun Bolor is shaken by the force!"],
      "100+": [
        "A powerful strike! Dulguun Bolor staggers."]
    },
    hitDialogues: {
      "1": [
        "Dulguun Bolor lands a precise hit."],
      "2-3": [
        "Dulguun Bolor strikes twice in quick succession!"],
      "4-5": [
        "A series of hits from Dulguun Bolor!"],
      "6-9": [
        "Dulguun Bolor's relentless assault is fierce!"],
      "10+": [
        "A devastating barrage from Dulguun Bolor!"]
    },
    getDamageDialogue(damage, playerName) {
      if (damage === 0) return selectDialogue(this.damageDialogues.zero);
      if (damage >= 1 && damage <= 20) return selectDialogue(this.damageDialogues["1-20"]);
      if (damage >= 21 && damage <= 35) return selectDialogue(this.damageDialogues["21-35"]);
      if (damage >= 36 && damage <= 75) return selectDialogue(this.damageDialogues["36-75"]);
      if (damage >= 76 && damage <= 99) return selectDialogue(this.damageDialogues["76-99"]);
      if (damage >= 100) return selectDialogue(this.damageDialogues["100+"]);
      return "";
    },
    getHitDialogue(hitCount, playerName) {
      if (hitCount === 1) return selectDialogue(this.hitDialogues["1"]);
      if (hitCount >= 2 && hitCount <= 3) return selectDialogue(this.hitDialogues["2-3"]);
      if (hitCount >= 4 && hitCount <= 5) return selectDialogue(this.hitDialogues["4-5"]);
      if (hitCount >= 6 && hitCount <= 9) return selectDialogue(this.hitDialogues["6-9"]);
      if (hitCount >= 10) return selectDialogue(this.hitDialogues["10+"]);
      return "";
    },
    About:"The Dulguun Bolor is in battle." ,
    toggleDialogues: {
      player1: [
        "Dulguun Bolor bellows: Engage, Jaybers8!",
        "Dulguun Bolor declares: Ready up, Jaybers8!"
      ],
      player2: [
        "Dulguun Bolor bellows: Engage, FLIGHTx12!",
        "Dulguun Bolor declares: Ready up, FLIGHTx12!"
      ]
    }
  },
  {
    name: "Bennu",
    attackType: "PERCEPTION",
    health: adjustHealthByQuarter(722),
    hitNumbers: [15, 16, 17, 18, 19, 20],
    Rewards:"Spinner gets to pick any available CO-OP game instead of spinning. Player also gains 50 ducats and a random weapon. ",
    Punishment:"Spinner Deletes 4 spin options. No CO-OP game will be picked this week. ",
    imageSrc: "https://i.ibb.co/fVN7Xhdh/Bennu-Ergo-Villian.jpg",
    defeatedImageSrc: "https://static.vecteezy.com/system/resources/thumbnails/023/122/996/small/skull-with-roses-human-skull-in-beautiful-flowers-halloween-images-day-of-the-dead-generative-ai-photo.jpg",
    damageDialogues: {
      zero: [
        "Bennu shrugs off the hit."],
      "1-20": [
        "Bennu takes a light hit."],
      "21-35": [
        "Bennu grunts from the blow."],
      "36-75": [
        "A strong hit! Bennu feels the impact!"],
      "76-99": [
        "Bennu is shaken by the force!"],
      "100+": [
        "A powerful strike! Bennu staggers."]
    },
    hitDialogues: {
      "1": [
        "Bennu lands a precise hit."],
      "2-3": [
        "Bennu strikes twice in quick succession!"],
      "4-5": [
        "A series of hits from Bennu!"],
      "6-9": [
        "Bennu's relentless assault is fierce!"],
      "10+": [
        "A devastating barrage from Bennu!"]
    },
    getDamageDialogue(damage, playerName) {
      if (damage === 0) return selectDialogue(this.damageDialogues.zero);
      if (damage >= 1 && damage <= 20) return selectDialogue(this.damageDialogues["1-20"]);
      if (damage >= 21 && damage <= 35) return selectDialogue(this.damageDialogues["21-35"]);
      if (damage >= 36 && damage <= 75) return selectDialogue(this.damageDialogues["36-75"]);
      if (damage >= 76 && damage <= 99) return selectDialogue(this.damageDialogues["76-99"]);
      if (damage >= 100) return selectDialogue(this.damageDialogues["100+"]);
      return "";
    },
    getHitDialogue(hitCount, playerName) {
      if (hitCount === 1) return selectDialogue(this.hitDialogues["1"]);
      if (hitCount >= 2 && hitCount <= 3) return selectDialogue(this.hitDialogues["2-3"]);
      if (hitCount >= 4 && hitCount <= 5) return selectDialogue(this.hitDialogues["4-5"]);
      if (hitCount >= 6 && hitCount <= 9) return selectDialogue(this.hitDialogues["6-9"]);
      if (hitCount >= 10) return selectDialogue(this.hitDialogues["10+"]);
      return "";
    },
    About:"The Bennu is in battle." ,
    toggleDialogues: {
      player1: [
        "Bennu soars: Fly in, Jaybers8!",
        "Bennu calls out: It’s your turn now, Jaybers8!"
      ],
      player2: [
        "Bennu soars: Fly in, FLIGHTx12!",
        "Bennu calls out: It’s your turn now, FLIGHTx12!"
      ]
    }
  },
  {
    name: "Forbearer Tren",
    attackType: "INTELLINGENCE",
    health: adjustHealthByQuarter(550),
    hitNumbers: [6, 8, 3, 12, 1, 1, 1, 1, 1, 1, ],
    Rewards:"Spinner gets to pick any available CO-OP game instead of spinning. Player also gains 50 ducats and a random weapon. ",
    Punishment:"Spinner Deletes 4 spin options. No CO-OP game will be picked this week. ",
    imageSrc: "https://i.ibb.co/W42ZGbd2/Forbearer-Tren-Ergo-Villian.jpg",
    defeatedImageSrc: "https://static.vecteezy.com/system/resources/thumbnails/023/122/996/small/skull-with-roses-human-skull-in-beautiful-flowers-halloween-images-day-of-the-dead-generative-ai-photo.jpg",
    damageDialogues: {
      zero: [
        "Forbearer Tren shrugs off the hit."],
      "1-20": [
        "Forbearer Tren takes a light hit."],
      "21-35": [
        "Forbearer Tren grunts from the blow."],
      "36-75": [
        "A strong hit! Forbearer Tren feels the impact!"],
      "76-99": [
        "Forbearer Tren is shaken by the force!"],
      "100+": [
        "A powerful strike! Forbearer Tren staggers."]
    },
    hitDialogues: {
      "1": [
        "Forbearer Tren lands a precise hit."],
      "2-3": [
        "Forbearer Tren strikes twice in quick succession!"],
      "4-5": [
        "A series of hits from Forbearer Tren!"],
      "6-9": [
        "Forbearer Tren's relentless assault is fierce!"],
      "10+": [
        "A devastating barrage from Forbearer Tren!"]
    },
    getDamageDialogue(damage, playerName) {
      if (damage === 0) return selectDialogue(this.damageDialogues.zero);
      if (damage >= 1 && damage <= 20) return selectDialogue(this.damageDialogues["1-20"]);
      if (damage >= 21 && damage <= 35) return selectDialogue(this.damageDialogues["21-35"]);
      if (damage >= 36 && damage <= 75) return selectDialogue(this.damageDialogues["36-75"]);
      if (damage >= 76 && damage <= 99) return selectDialogue(this.damageDialogues["76-99"]);
      if (damage >= 100) return selectDialogue(this.damageDialogues["100+"]);
      return "";
    },
    getHitDialogue(hitCount, playerName) {
      if (hitCount === 1) return selectDialogue(this.hitDialogues["1"]);
      if (hitCount >= 2 && hitCount <= 3) return selectDialogue(this.hitDialogues["2-3"]);
      if (hitCount >= 4 && hitCount <= 5) return selectDialogue(this.hitDialogues["4-5"]);
      if (hitCount >= 6 && hitCount <= 9) return selectDialogue(this.hitDialogues["6-9"]);
      if (hitCount >= 10) return selectDialogue(this.hitDialogues["10+"]);
      return "";
    },
    About:"The Forbearer Tren is in battle." ,
    toggleDialogues: {
      player1: [
        "Forbearer Tren advises: Focus up, Jaybers8!",
        "Forbearer Tren signals: Step into the arena, Jaybers8!"
      ],
      player2: [
        "Forbearer Tren advises: Focus up, FLIGHTx12!",
        "Forbearer Tren signals: Step into the arena, FLIGHTx12!"
      ]
    }
  },
  {
    name: "Tash-Nadia",
    attackType: "STRENGTH",
    health: adjustHealthByQuarter(809),
    hitNumbers: [1, 2, 2, 2, 4, 4, 4, 4, 20, 20, 20, 20],
    Rewards:"Spinner gets to pick any available CO-OP game instead of spinning. Player also gains 50 ducats and a random weapon. ",
    Punishment:"Spinner Deletes 4 spin options. No CO-OP game will be picked this week. ",
    imageSrc: "https://i.ibb.co/FLzybjYd/Tash-Nadia-Ergo-Villian.jpg",
    defeatedImageSrc: "https://static.vecteezy.com/system/resources/thumbnails/023/122/996/small/skull-with-roses-human-skull-in-beautiful-flowers-halloween-images-day-of-the-dead-generative-ai-photo.jpg",
    damageDialogues: {
      zero: [
        "Tash-Nadia shrugs off the hit."],
      "1-20": [
        "Tash-Nadia takes a light hit."],
      "21-35": [
        "Tash-Nadia grunts from the blow."],
      "36-75": [
        "A strong hit! Tash-Nadia feels the impact!"],
      "76-99": [
        "Tash-Nadia is shaken by the force!"],
      "100+": [
        "A powerful strike! Tash-Nadia staggers."]
    },
    hitDialogues: {
      "1": [
        "Tash-Nadia lands a precise hit."],
      "2-3": [
        "Tash-Nadia strikes twice in quick succession!"],
      "4-5": [
        "A series of hits from Tash-Nadia!"],
      "6-9": [
        "Tash-Nadia's relentless assault is fierce!"],
      "10+": [
        "A devastating barrage from Tash-Nadia!"]
    },
    getDamageDialogue(damage, playerName) {
      if (damage === 0) return selectDialogue(this.damageDialogues.zero);
      if (damage >= 1 && damage <= 20) return selectDialogue(this.damageDialogues["1-20"]);
      if (damage >= 21 && damage <= 35) return selectDialogue(this.damageDialogues["21-35"]);
      if (damage >= 36 && damage <= 75) return selectDialogue(this.damageDialogues["36-75"]);
      if (damage >= 76 && damage <= 99) return selectDialogue(this.damageDialogues["76-99"]);
      if (damage >= 100) return selectDialogue(this.damageDialogues["100+"]);
      return "";
    },
    getHitDialogue(hitCount, playerName) {
      if (hitCount === 1) return selectDialogue(this.hitDialogues["1"]);
      if (hitCount >= 2 && hitCount <= 3) return selectDialogue(this.hitDialogues["2-3"]);
      if (hitCount >= 4 && hitCount <= 5) return selectDialogue(this.hitDialogues["4-5"]);
      if (hitCount >= 6 && hitCount <= 9) return selectDialogue(this.hitDialogues["6-9"]);
      if (hitCount >= 10) return selectDialogue(this.hitDialogues["10+"]);
      return "";
    },
    About:"The Tash-Nadia is in battle." ,
    toggleDialogues: {
      player1: [
        "Tash-Nadia challenges: Show your might, Jaybers8!",
        "Tash-Nadia proclaims: Now toggle and fight, Jaybers8!"
      ],
      player2: [
        "Tash-Nadia challenges: Show your might, FLIGHTx12!",
        "Tash-Nadia proclaims: Now toggle and fight, FLIGHTx12!"
      ]
    }
  }
];
