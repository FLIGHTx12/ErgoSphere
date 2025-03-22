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

  // Ensure health doesn't go below zero
  return Math.max(0, baseHealth + (quarterMultiplier * 200));
}

// New helper: selects a random dialogue if an array
function selectDialogue(dialogue) {
  // Check if dialogue is an array and not empty
  if (Array.isArray(dialogue) && dialogue.length > 0) {
    return dialogue[Math.floor(Math.random() * dialogue.length)];
  } else {
    // Return the dialogue directly if it's not an array, or return an empty string if the array is empty
    return dialogue || "";
  }
}

window.monsters = [
  {name: "-Enemy Select-",
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
  {name: "EtchWraith Swarm",
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
        "More EtchWraiths join the fray, but the swarm remains undeterred.",
        "Some of these fucking bugs sound like they're laughing at you as you miss.",
        "As you swing, the EtchWraith Swarm splits apart and reforms, avoiding the hit.",
        "",
        "EtchWraith Swarm ignores the minor scratch.",
        "EtchWraith Swarm barely registers the hit.",
        "The swarm shifts and shimmers, your attack passing right through!" 
    ],
    "1-20": [
        "EtchWraith Swarm winces at the hit.",
        "buzz buzz",
        "One of the bugs falls to the ground, but the rest keep coming.",
        "two bugs crash into each other, some of the EtchWraiths start to eat the carcasses.",
        "buzzing in pain, EtchWraith Swarm recoils from the hit.",
        "A few EtchWraiths fall, their buzzing silenced, but the swarm presses on."
    ],
    "21-35": [
        "Sparks fly from the EtchWraith Swarm as it recoils from the blow!",
        "wings and legs fly everywhere as you strike the EtchWraith Swarm!",
        "EtchWraith Swarm buzz from the moderate blow.", 
        "The swarm recoils, a noticeable gap appearing in its mass."
    ],
    "36-75": [
        "You take out 4 bugs with one swing! Their bodies fall to the ground with a thud.",
        "A mighty strike! EtchWraith Swarm buzz in agony!", 
        "The swarm thins significantly as your attack cleaves through it!"
    ],
    "76-99": [
        "As the Swarm descends upon you, you strike them back with a powerful blow! bug legs and metallic wings fly everywhere!",
        "Your attack causes an explosion of bug parts! some of the EtchWraiths rush in to pick at the remains before darting at you again.",
        "The hit shakes EtchWraith Swarm deeply!",
        "The swarm falters, its movements becoming erratic as it tries to recover."
    ],
    "100+": [
        "You are fucking them up! EtchWraith Swarm buzzes in terror!",
        "A devastating blow! EtchWraith Swarm staggers.",
        "The swarm's buzzing reaches a fever pitch as it suffers immense damage!"
    ]
},
hitDialogues: {
    "1": [
        "The EtchWraith Swarm flys by you causing knicks and bruises as you fight them off.",
        "The EtchWraith Swarm lands a single, precise hit.", 
        "One of the EtchWraiths latches onto you, its mandibles scraping your armor."
    ], 
    "2-3": [
        "EtchWraith Swarm delivers quick successive blows!",
        "Fucking ergobugs spit acid on your armor! Life support systems are failing!",
        "You can't keep up with the EtchWraith Swarm's relentless assault!",
        "The swarm darts around you, inflicting multiple small wounds."
    ],
    "4-5": [
        "EtchWraith Swarm's furious assault shows no mercy!",
        "You are surrounded! These things are everywhere!",
        "A barrage! EtchWraith Swarm overwhelms the attacker!",
        "You stumble back as the swarm's attacks land in quick succession."
    ],
    "6-9": [
        "A mountain of bugs swarm you! All you can do is swing and hope to hit something as the !",
        "EtchWraith Swarm’s furious assault shows no mercy!",
        "You're engulfed in a sea of buzzing, biting EtchWraiths!" 
    ],
    "10+": [
        "A relentless barrage decimates the foe!",
        "The swarm's attack is overwhelming, leaving you reeling."
    ]
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
          "<span class='toggle-dialogue'>A high-pitched, collective shriek pierces the air as the EtchWraith Swarm descends on Jaybers8.</span>",
          "<span class='toggle-dialogue'>The EtchWraith Swarm's wings beat furiously, creating a deafening buzz that vibrates through Jaybers8's bones.</span>",
          "<span class='toggle-dialogue'>A wave of clicking mandibles and scraping chitin washes over Jaybers8 as the EtchWraith Swarm surges forward.</span>",
          "<span class='toggle-dialogue'>The air crackles with static as the EtchWraith Swarm's bodies rub together, a prelude to their attack on Jaybers8.</span>",
          "<span class='toggle-dialogue'>Jaybers8 is enveloped in a cloud of noxious fumes as the EtchWraith Swarm expels a foul-smelling gas.</span>",
          "<span class='toggle-dialogue'>A horrifying wave of skittering sounds emanates from the EtchWraith Swarm as they crawl towards Jaybers8.</span>",
          "<span class='toggle-dialogue'>The ground trembles beneath Jaybers8's feet as the EtchWraith Swarm's heavy bodies impact the arena.</span>",
          "<span class='toggle-dialogue'>A sickening crunch fills the air as the EtchWraith Swarm's mandibles snap open and close, targeting Jaybers8.</span>",
          "<span class='toggle-dialogue'>The EtchWraith Swarm pulses with dark energy, emitting a low, guttural hum that vibrates in Jaybers8's chest.</span>",
          "<span class='toggle-dialogue'>A frenzy of movement assaults Jaybers8's eyes as the EtchWraith Swarm swirls around her, a living vortex of chitin and rage.</span>"
      ],
      player2: [
          "<span class='toggle-dialogue'>A high-pitched, collective shriek pierces the air as the EtchWraith Swarm descends on FLIGHTx12!.</span>",
          "<span class='toggle-dialogue'>The EtchWraith Swarm's wings beat furiously, creating a deafening buzz that vibrates through FLIGHTx12!'s bones.</span>",
          "<span class='toggle-dialogue'>A wave of clicking mandibles and scraping chitin washes over FLIGHTx12! as the EtchWraith Swarm surges forward.</span>",
          "<span class='toggle-dialogue'>The air crackles with static as the EtchWraith Swarm's bodies rub together, a prelude to their attack on FLIGHTx12!.</span>",
          "<span class='toggle-dialogue'>FLIGHTx12! is enveloped in a cloud of noxious fumes as the EtchWraith Swarm expels a foul-smelling gas.</span>",
          "<span class='toggle-dialogue'>A horrifying wave of skittering sounds emanates from the EtchWraith Swarm as they crawl towards FLIGHTx12!.</span>",
          "<span class='toggle-dialogue'>The ground trembles beneath FLIGHTx12!'s feet as the EtchWraith Swarm's heavy bodies impact the arena.</span>",
          "<span class='toggle-dialogue'>A sickening crunch fills the air as the EtchWraith Swarm's mandibles snap open and close, targeting FLIGHTx12!.</span>",
          "<span class='toggle-dialogue'>The EtchWraith Swarm pulses with dark energy, emitting a low, guttural hum that vibrates in FLIGHTx12!'s chest.</span>",
          "<span class='toggle-dialogue'>A frenzy of movement assaults FLIGHTx12!'s eyes as the EtchWraith Swarm swirls around him, a living vortex of chitin and rage.</span>"
        ]
      }
  },
  {name: "CyberBadger Cete",
    attackType: "OverWhelm",
    health: adjustHealthByQuarter(500),
    hitNumbers: [15, 6, 6, 6, 4, 8, 9, 12, 2, 20 ],
    Rewards: "Party leader gets to pick any available PVP game this week.",
    Punishment:"Party leader deletes 1 HCMC probability and 2 weekday “FUN” events. Start up HCMC again unless PVP has been removed.",
    imageSrc: "https://i.ibb.co/XrMg0sFn/Ergo-Badgers-Ergo-Villian.jpg",
    defeatedImageSrc: "https://static.vecteezy.com/system/resources/thumbnails/023/122/996/small/skull-with-roses-human-skull-in-beautiful-flowers-halloween-images-day-of-the-dead-generative-ai-photo.jpg",
    damageDialogues: {
      zero: [
          "The CyberBadger Clan dodges the hit.",
          "The CyberBadger Swarm cackles and laughs as you swing and slip in some cyber shit! 💩 .",
          "CyberBadger Swarm ignores the minor scratch.",
          "One of the cyberbadgers deflects your blow with its augmented claws.",
          "A cyberbadger with glowing red eyes stares you down, unfazed."
      ],
      "1-20": [
          "A light jab makes CyberBadgers scatter.",
          "You graze one as three rush at you barking ferociously",
          "One of the cyberbadgers yelps as you clip its cybernetic leg.",
          "Sparks fly as your attack glances off a cyberbadger's reinforced skull."
      ],
      "21-35": [
          "You kick aA cyberbadger howls in pain as you crush its cybernetic jaw.",
          "You hear the crunch of metal and bone as your attack connects." 
      ],
      "36-75": [
          "You stab a Badger in the jaw as it snaps at you. The body goes limp. You clean your blade.",
          "A solid strike! CyberBadger Cete snarls in pain!",
          "One of the cyberbadgers collapses, its cybernetic enhancements sputtering and failing.",
          "The stench of burnt fur and ozone fills the air as a cyberbadger crumples to the ground."
      ],
      "76-99": [
          "MASSIVE BLOW! there are a lot fewer Cyberbadgers on the field now",
          "The force rattles CyberBadger Clan noticeably! A few scurry off.",
          "Several cyberbadgers are thrown back by the force of your attack, their cybernetics overloading.",
          "A cyberbadger's head explodes in a shower of sparks and gore."
      ],
      "100+": [
          "A crushing blow! The CyberBadgers waver. Thier green blood paints the battlefield",
          "The remaining cyberbadgers whimper and cower in fear.",
          "You've decimated the CyberBadger Clan! Their mangled bodies litter the ground."
      ]
  },
  hitDialogues: {
      "1": [
          "CyberBadger Swarm scores a sharp hit.",
          "A cyberbadger's claws rake across your armor, leaving deep gouges.",
          "You feel a sharp pain as a cyberbadger bites into your leg."
      ],
      "2-3": [
          "CyberBadger Swarm strikes twice in quick succession!",
          "Two cyberbadgers lunge at you, their cybernetic teeth bared.",
          "You're knocked off balance by a pair of cyberbadger attacks."
      ],
      "4-5": [
          "A flurry of hits from CyberBadger Swarm!",
          "Cyberbadgers swarm you, their claws and teeth tearing at your flesh.",
          "You're barely able to defend yourself as the cyberbadgers overwhelm you."
      ],
      "6-9": [
          "CyberBadger Swarm's relentless assault is terrifying!",
          "The ground is stained with your blood as the cyberbadgers continue their onslaught.",
          "You can feel your strength fading as the cyberbadgers' attacks take their toll."
      ],
      "10+": [
          "💥💥 4 CyberBadgers explode in your face! They have self destructable armor? WHAT THE FUCK!",
          "A CyberBadger badger is tired of your shit and takes a hunk out of your arm!",
          "A barrage from CyberBadger Swarm leaves devastation!",
          "You're thrown back by a series of explosions as several cyberbadgers self-destruct.",
          "The world goes black as the cyberbadgers' final attack overwhelms you."
      ]
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
        "<span class='toggle-dialogue'>The CyberBadger Cete lets out a series of guttural snarls, their cybernetic eyes glowing menacingly at Jaybers8.</span>",
        "<span class='toggle-dialogue'>A cacophony of metallic growls and snapping jaws erupts from the CyberBadger Clan as they charge Jaybers8.</span>",
        "<span class='toggle-dialogue'>The CyberBadger Cete's claws scrape against the ground, emitting sparks as they stalk Jaybers8.</span>",
        "<span class='toggle-dialogue'>A chorus of furious barks, enhanced by digital distortion, fills the air as the CyberBadger Clan targets Jaybers8.</span>",
        "<span class='toggle-dialogue'>The CyberBadger Cete foams at the mouth, a mix of saliva and glowing green ooze, as they fixate on Jaybers8.</span>",
        "<span class='toggle-dialogue'>A series of rapid, mechanical yips and growls emanates from the CyberBadger Clan as they close in on Jaybers8.</span>",
        "<span class='toggle-dialogue'>The CyberBadger Cete's cybernetic implants whir and click as they prepare to attack Jaybers8.</span>",
        "<span class='toggle-dialogue'>A frenzy of snarls and snapping sounds fills the air as the CyberBadger Clan lunges at Jaybers8.</span>",
        "<span class='toggle-dialogue'>The CyberBadger Cete's metallic growl reverberates through the arena, directed at Jaybers8.</span>",
        "<span class='toggle-dialogue'>A unified, digitized roar shakes the ground as the CyberBadger Clan advances on Jaybers8.</span>"
    ],
    player2: [
        "<span class='toggle-dialogue'>The CyberBadger Cete lets out a series of guttural snarls, their cybernetic eyes glowing menacingly at FLIGHTx12!.</span>",
        "<span class='toggle-dialogue'>A cacophony of metallic growls and snapping jaws erupts from the CyberBadger Clan as they charge FLIGHTx12!.</span>",
        "<span class='toggle-dialogue'>The CyberBadger Cete's claws scrape against the ground, emitting sparks as they stalk FLIGHTx12!.</span>",
        "<span class='toggle-dialogue'>A chorus of furious barks, enhanced by digital distortion, fills the air as the CyberBadger Clan targets FLIGHTx12!.</span>",
        "<span class='toggle-dialogue'>The CyberBadger Cete foams at the mouth, a mix of saliva and glowing green ooze, as they fixate on FLIGHTx12!.</span>",
        "<span class='toggle-dialogue'>A series of rapid, mechanical yips and growls emanates from the CyberBadger Clan as they close in on FLIGHTx12!.</span>",
        "<span class='toggle-dialogue'>The CyberBadger Cete's cybernetic implants whir and click as they prepare to attack FLIGHTx12!.</span>",
        "<span class='toggle-dialogue'>A frenzy of snarls and snapping sounds fills the air as the CyberBadger Clan lunges at FLIGHTx12!.</span>",
        "<span class='toggle-dialogue'>The CyberBadger Cete's metallic growl reverberates through the arena, directed at FLIGHTx12!.</span>",
        "<span class='toggle-dialogue'>A unified, digitized roar shakes the ground as the CyberBadger Clan advances on FLIGHTx12!.</span>"
    ]
    }
  },
  {name: "Forbearer-Ramis",
    attackType: "CONSTITUTION",
    health: adjustHealthByQuarter(1205),
    hitNumbers: [15, 6,  4, 20, 20, 20],
    Rewards:"Party leader gets to pick any available PVP game for the week. Party also gains 50 ducats ",
    Punishment:"{CONFUSION} All rounds for fight night have the “Confusion” mod for this week.Party leader deletes 2 spin options and 2 weekday “FUN” events (can not be PvP). No PvP game will be picked this week. ",
    imageSrc: "https://i.ibb.co/JWj2G6mp/Forbearer-Ramis-Ergo-Villian.jpg",
    defeatedImageSrc: "https://static.vecteezy.com/system/resources/thumbnails/023/122/996/small/skull-with-roses-human-skull-in-beautiful-flowers-halloween-images-day-of-the-dead-generative-ai-photo.jpg",
    damageDialogues: {
      zero: [
          "Ramis gracefully floats away from your attack.", 
          "Ramis teleports before the hit lands.",
          "Forbearer-Ramis shrugs off the hit.",
          "With a mocking laugh, Ramis disappears in a flash of light, your attack striking only empty air.",
          "Your attack passes through Ramis as if he were a phantom, his form flickering erratically."
      ],
      "1-20": [
          "Forbearer-Ramis takes a light hit.",
          "Forbearer-Ramis takes a minor hit.",
          "Forbearer-Ramis teleports away but buckles to one knee. Your hit must have landed before he got away!",
          "Ramis stumbles back, a look of surprise crossing his face. 'An unexpected tingle,' he mutters.",
          "A flicker of pain crosses Ramis's eyes, but he quickly recovers. 'Is that the best you can do?' he taunts."
      ],
      "21-35": [
          "Forbearer-Ramis grunts from the blow.",
          "'You know I cant feel this right?,' Ramis growls.",
          "Forbearer-Ramis takes a moderate hit.",
          "Forbearer-Ramis is visibly enjoys the punishment you just handed him.",
          "Ramis lets out a guttural cry, a mixture of pain and pleasure. 'More! Give me more!' he demands.",
          "You see a hint of respect in Ramis's eyes. 'You're not entirely without merit,' he concedes."
      ],
      "36-75": [
          "'You're more resourceful than I anticipated,' Ramis observes, 'But it won't be enough.'",
          "A strong hit! Forbearer-Ramis feels the impact!",
          "Forbearer-Ramis spits out blood and laughs, He looks like he wants more!",
          "Ramis staggers, clutching his side. 'An impressive blow,' he admits, 'But I've endured worse.'",
          "You knock Ramis to the ground, but he quickly springs back to his feet. 'This is getting interesting,' he says with a wicked grin."
      ],
      "76-99": [
          "You dodge Ramis's attack spin behind him before striking him in the back!",
          "You knee Ramis in the face! He stumbles back and lands on his ass",
          "'You're starting to annoy me,' Ramis growls.",
          "Forbearer-Ramis is shaken by the force!",
          "Ramis's eyes widen in shock. 'You dare challenge my authority?' he roars.",
          "A look of fury crosses Ramis's face. 'You'll pay for that!' he screams."
      ],
      "100+": [
          "Forbearer-Ramis scoffs, 'A minor setback.'",
          "A powerful strike! Forbearer-Ramis staggers.",
          "Ramis collapses to one knee, his body wracked with pain. 'This cannot be,' he whispers.",
          "You see a flicker of fear in Ramis's eyes. 'Have I finally met my match?' he wonders."
      ]
  },
  hitDialogues: {
      "1": [
          "Ramis throws dirt in your eyes, when you recover he is nowhere to be seen",
          "Forbearer-Ramis lands a precise hit.'I train for this bitch!' ",
          "Ramis materializes behind you, his blade drawing a thin line of blood across your back."
      ],
      "2-3": [
          "Ramis throws 10 knives in the air in your general direction. A few stab you in the shoulder.",
          "Forbearer-Ramis strikes twice in quick succession!",
          "You're caught off guard by Ramis's sudden attack, his blows landing with pinpoint accuracy."
      ],
      "4-5": [
          "A series of hits from Forbearer-Ramis!",
          "Ramis moves with blinding speed, his attacks coming from all directions.",
          "You're barely able to keep up with Ramis's relentless assault."
      ],
      "6-9": [
          "Forbearer-Ramis's relentless assault is fierce!",
          "Ramis's attacks are relentless, each one pushing you closer to the brink.",
          "You're starting to feel overwhelmed by Ramis's sheer power."
      ],
      "10+": [
          "A devastating barrage from Forbearer-Ramis!",
          "Ramis unleashes his full fury, his attacks raining down upon you like a storm.",
          "You're helpless to defend yourself as Ramis's final attack obliterates you."
      ]
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
        "<span class='toggle-dialogue'>Forbearer-Ramis grunts: Stand your ground, Jaybers8!</span>",
        "<span class='toggle-dialogue'>Forbearer-Ramis calls: Now toggle and face me, Jaybers8!</span>"
      ],
      player2: [
        "<span class='toggle-dialogue'>Forbearer-Ramis grunts: Stand your ground, FLIGHTx12!</span>",
        "<span class='toggle-dialogue'>Forbearer-Ramis calls: Now toggle and face me, FLIGHTx12!</span>"
      ]
    }
  },
  {name: "PURSCERx17",
    attackType: "STRENGTH",
    health: adjustHealthByQuarter(900),
    hitNumbers: [17, 17, 17, 17, 17, 17, 1, 1, 8, 8, 12, 5, 5,],
    Rewards:"Party leader gets to pick any available PVP game for the week. Party also gains 50 ducats ",
    Punishment:" {AGRESSER} Add 10 mins to daily 30 min work out for the rest of the week. Spinner Deletes 2 spin options and 2 weekday “FUN” events (can not be PvP). No PvP game will be picked this week.",
    imageSrc: "https://i.ibb.co/mFDZz1p3/PURSCERx17-Ergo-Villian.jpg",
    defeatedImageSrc: "https://static.vecteezy.com/system/resources/thumbnails/023/122/996/small/skull-with-roses-human-skull-in-beautiful-flowers-halloween-images-day-of-the-dead-generative-ai-photo.jpg",
    damageDialogues: {
      zero: [
        "PURSCERx17 steps to the side avoiding your attack 'Thats all you workin with pussy?'. 😂",
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
        "PURSCERx17 givs you a 2 peice with wings to your gut! You hop back in fear of his next swing",
        "PURSCERx17 Walks up slowely, tanking your attacks. Suddenly he smacks the shit outta you! Blood drips from your mouth. You face feels swollen ",
        "PURSCERx17 strikes twice in quick succession!"],
      "4-5": [
        "A series of hits from PURSCERx17!"],
      "6-9": [
        "PURSCERx17's relentless assault is fierce!",
        "PURSCER uppercuts you and you land 10ft away. Your shoulder and back feel numb. "
      ],
      "10+": [
        "PURSCERx17 Jumps 30ft closing the gap and landing in front of you. You trurn to run but it's too late. He grabs you with one hand and pounds your face with the other. When he is done your face is a bloddy mess.",
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
        "<span class='toggle-dialogue'>PURSCERx17 roars at Jaybers8: 'You think you're quick, Belkan? I'll catch you in my grip!'</span>",
        "<span class='toggle-dialogue'>PURSCERx17's tentacle-dreads writhe: 'Ramis wants you broken, Jaybers8!'</span>",
        "<span class='toggle-dialogue'>PURSCERx17 sneers: 'Your kind are all bark, little Belkan.'</span>",
        "<span class='toggle-dialogue'>PURSCERx17 booms: 'Belkan! You'll wish you never crossed our paths!'</span>",
        "<span class='toggle-dialogue'>'Hah! You think your little tricks will work on *me*, Belkan?' PURSCERx17 laughs.</span>",
        "<span class='toggle-dialogue'>PURSCERx17's voice drips with menace: 'Your pathetic little agility won't save you Belkan.'</span>",
        "<span class='toggle-dialogue'>'I'll show you what a *real* fight looks like, Jaybers8!' PURSCERx17 taunts.</span>",
        "<span class='toggle-dialogue'>PURSCERx17 laughs maniacally: 'Belkans are so weak... it's pathetic!'</span>",
        "<span class='toggle-dialogue'>A deep growl emanates from PURSCERx17: 'Belkan, I'll enjoy crushing you.'</span>",
        "<span class='toggle-dialogue'>PURSCERx17 says to Jaybers8: You're nothing but a pest.'</span>"
    ],
    player2: [
        "<span class='toggle-dialogue'>PURSCERx17 roars at FLIGHTx12!: 'Dilardian, you smell like weakness!'</span>",
        "<span class='toggle-dialogue'>PURSCERx17's tentacle-dreads writhe: 'Ramis will be pleased to have your head, Dilardian!'</span>",
        "<span class='toggle-dialogue'>PURSCERx17 sneers: 'You big idiots will all fall.'</span>",
        "<span class='toggle-dialogue'>PURSCERx17 booms: 'Dilardian! You'll wish you never crossed our paths!'</span>",
        "<span class='toggle-dialogue'>'Hah! You think your tough act will work on *me*, Dilardian?' PURSCERx17 laughs.</span>",
        "<span class='toggle-dialogue'>PURSCERx17's voice drips with menace: 'All that muscle just makes you a bigger target Dilardian!'</span>",
        "<span class='toggle-dialogue'>'I'll show you what a *real* fight looks like, FLIGHTx12!' PURSCERx17 taunts.</span>",
        "<span class='toggle-dialogue'>PURSCERx17 laughs maniacally: 'Dilardians are so strong... it's fun to rip them to pieces!'</span>",
        "<span class='toggle-dialogue'>A deep growl emanates from PURSCERx17: 'Dilardian, I'll enjoy tearing your arms off.'</span>",
        "<span class='toggle-dialogue'>PURSCERx17 says to FLIGHTx12!: You're nothing but a bug!'</span>"
    ]
    }
  },
  {name: "Aphen Neel",
    attackType: "INTELLINGENCE",
    health: adjustHealthByQuarter(580),
    hitNumbers: [16, 6, 6, 6, 7, 19, 3, 3, 14],
    Rewards:"Party leader gets to pick any available PVP game for the week. Party also gains 50 ducats ",
    Punishment:"{DECEPTION} All bets only pay half of the winnings this week. Party leader deletes 2 spin options and 2 weekday “FUN” events (can not be PvP). No PvP game will be picked this week. ",
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
        "<span class='toggle-dialogue'>Aphen Neel says to Jaybers8: 'Do you even comprehend the forces you are meddling with, Belkan?'</span>",
        "<span class='toggle-dialogue'>Aphen Neel's voice shimmers with illusion: 'Such a bright aura, Jaybers8... it will be a shame to dim it.'</span>",
        "<span class='toggle-dialogue'>Aphen Neel remarks to Jaybers8: 'Your efforts are amusing, little Belkan.'</span>",
        "<span class='toggle-dialogue'>Aphen Neel's eyes glow: 'The light bends to my will, Belkan.'</span>",
        "<span class='toggle-dialogue'>Aphen Neel says to Jaybers8: 'You are outmatched, little Belkan.'</span>",
        "<span class='toggle-dialogue'>Aphen Neel's voice drips with disdain: 'Your kind are so predictable, Belkan.'</span>",
        "<span class='toggle-dialogue'>Aphen Neel gestures languidly: 'Embrace the shadows, Belkan. It is your destiny.'</span>",
        "<span class='toggle-dialogue'>Aphen Neel whispers to Jaybers8: 'I know your deepest fears, Belkan.'</span>",
        "<span class='toggle-dialogue'>Aphen Neel says to Jaybers8: 'Your struggles are pointless, Belkan.'</span>",
        "<span class='toggle-dialogue'>Aphen Neel says to Jaybers8: 'You will learn respect, Belkan.'</span>"
    ],
    player2: [
        "<span class='toggle-dialogue'>Aphen Neel says to FLIGHTx12!: 'Do you even comprehend the forces you are meddling with, Dilardian?'</span>",
        "<span class='toggle-dialogue'>Aphen Neel's voice shimmers with illusion: 'Such a bright aura, Dilardian... it will be a shame to dim it.'</span>",
        "<span class='toggle-dialogue'>Aphen Neel remarks to FLIGHTx12!: 'Your efforts are amusing, little Dilardian.'</span>",
        "<span class='toggle-dialogue'>Aphen Neel's eyes glow: 'The light bends to my will, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Aphen Neel says to FLIGHTx12!: 'You are outmatched, little Dilardian.'</span>",
        "<span class='toggle-dialogue'>Aphen Neel's voice drips with disdain: 'Your kind are so predictable, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Aphen Neel gestures languidly: 'Embrace the shadows, Dilardian. It is your destiny.'</span>",
        "<span class='toggle-dialogue'>Aphen Neel whispers to FLIGHTx12!: 'I know your deepest fears, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Aphen Neel says to FLIGHTx12!: 'Your struggles are pointless, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Aphen Neel says to FLIGHTx12!: 'You will learn respect, Dilardian.'</span>"
    ]
    }
  },
  {name: "Curve",
    attackType: "PERCEPTION",
    health: adjustHealthByQuarter(612),
    hitNumbers: [1, 2, 3, 4, 5],
    Rewards:"Party leader gets to pick any available PVP game for the week. Party also gains 50 ducats ",
    Punishment:"{CLAIRVOYANCE} Block and positive weekly mods gained next week. Party leader deletes 2 spin options and 2 weekday “FUN” events (can not be PvP). No PvP game will be picked this week ",
    imageSrc: "https://i.ibb.co/6JB8WQ2g/Curve-Ergo-Villian.jpg",
    defeatedImageSrc: "https://static.vecteezy.com/system/resources/thumbnails/023/122/996/small/skull-with-roses-human-skull-in-beautiful-flowers-halloween-images-day-of-the-dead-generative-ai-photo.jpg",
    damageDialogues: {
      zero: [
        "Curve smirks: 'you are so predictable'.",
        "Curve smirks: 'Saw that a mile away pussy'.",
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
        "<span class='toggle-dialogue'>CURVE says to Jaybers8: 'Your moves... predictable. But not for long, Belkan.'</span>",
        "<span class='toggle-dialogue'>CURVE says to Jaybers8: 'I saw this coming... almost, Belkan.'</span>",
        "<span class='toggle-dialogue'>CURVE says to Jaybers8: 'You disrupt the flow, Belkan.'</span>",
        "<span class='toggle-dialogue'>CURVE says to Jaybers8: 'The future is uncertain... because of you, Belkan.'</span>",
        "<span class='toggle-dialogue'>CURVE says to Jaybers8: 'This ends now, Belkan.'</span>",
        "<span class='toggle-dialogue'>CURVE says to Jaybers8: 'You cannot escape what is to come, Belkan.'</span>",
        "<span class='toggle-dialogue'>CURVE says to Jaybers8: 'Your chaos... it interferes with my sight, Belkan.'</span>",
        "<span class='toggle-dialogue'>CURVE says to Jaybers8: 'I know how this plays out, Belkan... and you lose.'</span>",
        "<span class='toggle-dialogue'>CURVE says to Jaybers8: 'The threads of fate... they resist your touch, Belkan.'</span>",
        "<span class='toggle-dialogue'>CURVE says to Jaybers8: 'Time is on my side, Belkan.'</span>"
    ],
    player2: [
        "<span class='toggle-dialogue'>CURVE says to FLIGHTx12!: 'Your moves... predictable. But not for long, Dilardian.'</span>",
        "<span class='toggle-dialogue'>CURVE says to FLIGHTx12!: 'I saw this coming... almost, Dilardian.'</span>",
        "<span class='toggle-dialogue'>CURVE says to FLIGHTx12!: 'You disrupt the flow, Dilardian.'</span>",
        "<span class='toggle-dialogue'>CURVE says to FLIGHTx12!: 'The future is uncertain... because of you, Dilardian.'</span>",
        "<span class='toggle-dialogue'>CURVE says to FLIGHTx12!: 'This ends now, Dilardian.'</span>",
        "<span class='toggle-dialogue'>CURVE says to FLIGHTx12!: 'You cannot escape what is to come, Dilardian.'</span>",
        "<span class='toggle-dialogue'>CURVE says to FLIGHTx12!: 'Your chaos... it interferes with my sight, Dilardian.'</span>",
        "<span class='toggle-dialogue'>CURVE says to FLIGHTx12!: 'I know how this plays out, Dilardian... and you lose.'</span>",
        "<span class='toggle-dialogue'>CURVE says to FLIGHTx12!: 'The threads of fate... they resist your touch, Dilardian.'</span>",
        "<span class='toggle-dialogue'>CURVE says to FLIGHTx12!: 'Time is on my side, Dilardian.'</span>"
      ]
    }
  },
  {name: "Dulguun Bolor",
    attackType: "CONSTITUTION",
    health: adjustHealthByQuarter(1610),
    hitNumbers: [2, 11, 19, 13, 13],
    Rewards:"Party leader gets to pick any available CO-OP game. Player also gains 50 ducats.",
    Punishment:"{Vegicide} Each party member must pick one day this week to abstain from meat consumption. Party leader deletes 4 HCMC probabilities. No CO-OP game will be picked this week.", 
    "genre": "ERGOvillians",
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
            "<span class='toggle-dialogue'>Dulguun Bolor's ancient voice rumbles: 'Jaybers8, the spores hunger for your warmth.'</span>",
            "<span class='toggle-dialogue'>A fungal hiss echoes from Dulguun Bolor: 'Your agility is fleeting, Belkan.'</span>",
            "<span class='toggle-dialogue'>Dulguun Bolor snarls, her eyes glowing: 'The hunt will end swiftly, Jaybers8.'</span>",
            "<span class='toggle-dialogue'>Spores erupt from Dulguun Bolor's mane: 'Feel the embrace of the ancient rot, Belkan.'</span>",
            "<span class='toggle-dialogue'>Dulguun Bolor's voice cracks: 'Jaybers8, your spirit will feed the cycle.'</span>",
            "<span class='toggle-dialogue'>A deep growl resonates: 'Belkan, your world will crumble like mine.'</span>",
            "<span class='toggle-dialogue'>Dulguun Bolor's fungal voice whispers: 'Join us, Jaybers8, become one with the ErgoSphere.'</span>",
            "<span class='toggle-dialogue'>Dulguun Bolor's eyes fixate on Jaybers8: 'The ancient hunt begins anew.'</span>",
            "<span class='toggle-dialogue'>A chilling growl emanates from Dulguun Bolor: 'Belkan, you cannot escape the inevitable.'</span>",
            "<span class='toggle-dialogue'>Dulguun Bolor's voice booms: 'Your resistance is futile, Jaybers8!'</span>"
        ],
        player2: [
            "<span class='toggle-dialogue'>Dulguun Bolor's ancient voice rumbles: 'FLIGHTx12!, your strength will wither like the old world.'</span>",
            "<span class='toggle-dialogue'>A fungal hiss echoes from Dulguun Bolor: 'Your defiance is meaningless, Dilardian.'</span>",
            "<span class='toggle-dialogue'>Dulguun Bolor snarls, her eyes glowing: 'The hunt will end swiftly, Dilardian.'</span>",
            "<span class='toggle-dialogue'>Spores erupt from Dulguun Bolor's mane: 'Feel the embrace of the ancient rot, Dilardian.'</span>",
            "<span class='toggle-dialogue'>Dulguun Bolor's voice cracks: 'FLIGHTx12!, your blood will feed the cycle.'</span>",
            "<span class='toggle-dialogue'>A deep growl resonates: 'Dilardian, your world will crumble like mine.'</span>",
            "<span class='toggle-dialogue'>Dulguun Bolor's fungal voice whispers: 'Join us, FLIGHTx12!, become one with the ErgoSphere.'</span>",
            "<span class='toggle-dialogue'>Dulguun Bolor's eyes fixate on FLIGHTx12!: 'The ancient hunt begins anew.'</span>",
            "<span class='toggle-dialogue'>A chilling growl emanates from Dulguun Bolor: 'Dilardian, you cannot escape the inevitable.'</span>",
            "<span class='toggle-dialogue'>Dulguun Bolor's voice booms: 'Your resistance is futile, FLIGHTx12!'</span>"
          ]
        }
  },
  {name: "Bennu",
    attackType: "PERCEPTION",
    health: adjustHealthByQuarter(722),
    hitNumbers: [15, 16, 17, 18, 19, 20],
    Rewards:"Spinner gets to pick any available CO-OP game instead of spinning. Player also gains 50 ducats and a random weapon. ",
    Punishment:"{Borracho} Each party member must play on level above the Gig Game requirement during the next weekly Rockband session. Party leader deletes 4 HCMC probabilities. No CO-OP game will be picked this week.", 
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
        "<span class='toggle-dialogue'>Bennu says to Jaybers8: 'Hey there, Belkan! You wanna party or fight? Either way, let's make it quick, I got places to be.'</span>",
        "<span class='toggle-dialogue'>Bennu says to Jaybers8: 'This is getting boring. Where's the music, Belkan?'</span>",
        "<span class='toggle-dialogue'>Bennu yawns: 'Fighting already? It's barely noon in the ErgoSphere, Belkan.'</span>",
        "<span class='toggle-dialogue'>Bennu says to Jaybers8: 'You hit hard, Belkan, but can you keep up with my disappearing act?'</span>",
        "<span class='toggle-dialogue'>Bennu says to Jaybers8: 'Let's turn up the heat, Belkan... or maybe just turn up the music?'</span>",
        "<span class='toggle-dialogue'>Bennu says to Jaybers8: 'You're cramping my style, Belkan.'</span>",
        "<span class='toggle-dialogue'>Bennu says to Jaybers8: 'This ErgoSphere is wild, but you're bringing it down, Belkan.'</span>",
        "<span class='toggle-dialogue'>Bennu says to Jaybers8: 'Come on, Belkan, where's the fun in this?'</span>",
        "<span class='toggle-dialogue'>Bennu says to Jaybers8: 'You're harshing my buzz, Belkan.'</span>",
        "<span class='toggle-dialogue'>Bennu says to Jaybers8: 'Look, Belkan, can we just skip this and grab a drink?'</span>"
    ],
    player2: [
        "<span class='toggle-dialogue'>Bennu says to FLIGHTx12!: 'Hey there, Dilardian! You wanna party or fight? Either way, let's make it quick, I got places to be.'</span>",
        "<span class='toggle-dialogue'>Bennu says to FLIGHTx12!: 'This is getting boring. Where's the music, Dilardian?'</span>",
        "<span class='toggle-dialogue'>Bennu yawns: 'Fighting already? It's barely noon in the ErgoSphere, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Bennu says to FLIGHTx12!: 'You hit hard, Dilardian, but can you keep up with my disappearing act?'</span>",
        "<span class='toggle-dialogue'>Bennu says to FLIGHTx12!: 'Let's turn up the heat, Dilardian... or maybe just turn up the music?'</span>",
        "<span class='toggle-dialogue'>Bennu says to FLIGHTx12!: 'You're cramping my style, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Bennu says to FLIGHTx12!: 'This ErgoSphere is wild, but you're bringing it down, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Bennu says to FLIGHTx12!: 'Come on, Dilardian, where's the fun in this?'</span>",
        "<span class='toggle-dialogue'>Bennu says to FLIGHTx12!: 'You're harshing my buzz, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Bennu says to FLIGHTx12!: 'Look, Dilardian, can we just skip this and grab a drink?'</span>"
    ]
    }
  },
  { name: "Forbearer Tren",
    attackType: "INTELLINGENCE",
    health: adjustHealthByQuarter(550),
    hitNumbers: [6, 8, 3, 12, 1, 1, 1, 1, 1, 1, ],
    Rewards:"Party leader gets to pick any available CO-OP game. Player also gains 50 ducats.",
    Punishment: "{Hypnopompia} If the Party leader is the current Bingwa and or Atletico champ, remove your title and swap with the Kushindwa and or Atletico loser. All choices stay the same but all other rewards go to other player. Party leader deletes 4 HCMC probabilities. No CO-OP game will be picked this week.",
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
        "<span class='toggle-dialogue'>Forebearer Tren says to Jaybers8: 'You remind me of old Belka, child, but your path is foolish.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren gestures wearily: 'The ErgoSphere... it does not change, why should you, Belkan?'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren murmurs to Jaybers8: 'You seek to alter the flow, Belkan, but the flow will consume you.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to Jaybers8: 'Your struggles are fleeting, Belkan. The ErgoSphere endures.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren's voice echoes with age: 'I have seen countless like you, Belkan. All lost to time.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to Jaybers8: 'Change is an illusion, Belkan. Embrace the stagnation.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren gestures: 'The creatures of the ErgoSphere heed my call, Belkan. They will decide your fate.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to Jaybers8: 'You fight against the inevitable, Belkan. Rest, and let the ErgoSphere take its course.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to Jaybers8: 'Your magic is crude, Belkan. You cannot comprehend the true forces at play.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to Jaybers8: 'I offer you a choice, Belkan: Yield, or be lost.'</span>"
    ],
    player2: [
        "<span class='toggle-dialogue'>Forebearer Tren says to FLIGHTx12!: 'You remind me of old Belka, child, but your path is foolish.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren gestures wearily: 'The ErgoSphere... it does not change, why should you, Dilardian?'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren murmurs to FLIGHTx12!: 'You seek to alter the flow, Dilardian, but the flow will consume you.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to FLIGHTx12!: 'Your struggles are fleeting, Dilardian. The ErgoSphere endures.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren's voice echoes with age: 'I have seen countless like you, Dilardian. All lost to time.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to FLIGHTx12!: 'Change is an illusion, Dilardian. Embrace the stagnation.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren gestures: 'The creatures of the ErgoSphere heed my call, Dilardian. They will decide your fate.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to FLIGHTx12!: 'You fight against the inevitable, Dilardian. Rest, and let the ErgoSphere take its course.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to FLIGHTx12!: 'Your magic is crude, Dilardian. You cannot comprehend the true forces at play.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to FLIGHTx12!: 'I offer you a choice, Dilardian: Yield, or be lost.'</span>"
    ]
    }
  },
  {name: "Tash-Nadia",
    attackType: "STRENGTH",
    health: adjustHealthByQuarter(809),
    hitNumbers: [1, 2, 2, 2, 4, 4, 4, 4, 20, 20, 20, 20],
    Rewards:"Party leader gets to pick any available CO-OP game. Player also gains 50 ducats.",
    Punishment:"{Dagon’s Curse} Remove all fish from the menu this week. One Co-op day becomes a deep clean fish tank day. Party leader deletes 4 HCMC probabilities. No CO-OP game will be picked this week.",
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
        "<span class='toggle-dialogue'>Tash Nadia says to Jaybers8: 'The depths call for you, Belkan.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia's voice rumbles: 'You fight with the ferocity of surface dwellers, Jaybers8.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to Jaybers8: 'The currents of fate pull you under, Belkan.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to Jaybers8: 'Your world is dry and brittle, Belkan.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to Jaybers8: 'Feel the crushing pressure, Belkan.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to Jaybers8: 'You do not belong here, Belkan.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to Jaybers8: 'The abyss awaits, Belkan.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to Jaybers8: 'Your struggles are futile, Belkan.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to Jaybers8: 'The water will claim you, Belkan.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to Jaybers8: 'You will drown in the ErgoSphere, Belkan.'</span>"
    ],
    player2: [
        "<span class='toggle-dialogue'>Tash Nadia says to FLIGHTx12!: 'The depths call for you, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia's voice rumbles: 'You fight with the ferocity of surface dwellers, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to FLIGHTx12!: 'The currents of fate pull you under, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to FLIGHTx12!: 'Your world is dry and brittle, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to FLIGHTx12!: 'Feel the crushing pressure, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to FLIGHTx12!: 'You do not belong here, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to FLIGHTx12!: 'The abyss awaits, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to FLIGHTx12!: 'Your struggles are futile, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to FLIGHTx12!: 'The water will claim you, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to FLIGHTx12!: 'You will drown in the ErgoSphere, Dilardian.'</span>"
    ]
    }
  }
];
