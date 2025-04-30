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
        "Curve shrugs off the hit.",
        "Curve's eyes flicker, 'Irrelevant timeline.'",
        "Curve says, 'That didn't even make a dent in my calculations.'",
        "Curve says, 'You're wasting your time, I already know your next move.'",
        "Curve says, 'Your attacks are like static noise to me.'",
        "Curve says, 'I saw that coming before you even thought of it.'",
        "Curve says, 'You're not fast enough to surprise me.'",
        "Curve says, 'Prepare to face the consequences of your predictable actions!'"
      ],
      "1-20": [
        "Curve takes a light hit.",
        "Curve's visor cracks slightly, 'A minor deviation.'",
        "Curve mutters, 'An anomaly, but within acceptable parameters.'",
        "Curve says, 'That was a close one, but I'm still in control.'",
        "Curve says, 'You've managed to catch me off guard.'",
        "Curve says, 'This is a minor setback, I'll adjust my predictions.'",
        "Curve says, 'I've accounted for this possibility.'",
        "Curve says, 'You're not as predictable as I thought.'",
        "Curve says, 'I'm impressed, but it won't happen again.'",
        "Curve says, 'You're gonna regret that!'"
      ],
      "21-35": [
        "Curve grunts from the blow.",
        "Curve's voice glitches, 'The timeline... it's shifting.'",
        "Curve's hand clenches, 'You are disrupting the flow.'",
        "Curve says, 'That actually caused a ripple in my calculations.'",
        "Curve says, 'You've managed to disrupt my focus.'",
        "Curve says, 'This is starting to become a problem.'",
        "Curve says, 'You're making me recalculate my strategy.'",
        "Curve says, 'You're not playing by the rules of time.'",
        "Curve says, 'Don't think you're winning, this is just a temporary setback.'",
        "Curve says, 'You're gonna face the consequences of your actions!'"
      ],
      "36-75": [
        "A strong hit! Curve feels the impact!",
        "Curve's body flickers, 'The future... it's uncertain.'",
        "Curve's eyes widen, 'You dare defy destiny?'",
        "Curve says, 'Okay, now you've done it!'",
        "Curve says, 'That was a good one, but I'm still standing.'",
        "Curve says, 'You're making me strain my precognitive abilities.'",
        "Curve says, 'You're pushing your luck, time-bender.'",
        "Curve says, 'This is getting interesting, but I'm still gonna win.'",
        "Curve says, 'Prepare to face the wrath of time!'"
      ],
      "76-99": [
        "Curve is shaken by the force!",
        "Curve staggers back, 'The timelines... they're diverging.'",
        "Curve's voice cracks, 'You're altering the course of events!'",
        "Curve says, 'Okay, you're strong, but I'm stronger!'",
        "Curve says, 'That was a close one, but I'm not going down yet.'",
        "Curve says, 'You're making me use my full potential.'",
        "Curve says, 'You're about to witness the true power of precognition!'",
        "Curve says, 'This is the last time you hit me that hard!'",
        "Curve says, 'You're gonna feel the full force of temporal energy!'"
      ],
      "100+": [
        "A powerful strike! Curve staggers.",
        "Curve collapses, 'The future... it's fading.'",
        "Curve's form shimmers, 'The ErgoSphere... it rejects you.'",
        "Curve's voice fades, 'The flow of time... it's unraveling...'",
        "Curve says, 'I can't believe this is happening!'",
        "Curve says, 'You're too unpredictable for me, but I'll be back!'",
        "Curve says, 'I'm out of here, this isn't worth it!'",
        "Curve says, 'You may have won this battle, but the war for time isn't over!'",
        "Curve says, 'I'm retreating, but I'll come back with a clearer vision!'",
        "Curve says, 'This isn't the end, it's just a temporary distortion!'"
      ]
    },
    hitDialogues: {
      "1": [
        "Curve lands a precise hit.",
        "Curve's movements are fluid, 'The future bends to my will.'",
        "Curve's eyes glow, 'You're moving exactly as I predicted.'",
        "Curve says, 'A calculated strike.'",
        "Curve says, 'First blood was inevitable.'",
        "Curve says, 'You're falling into my trap.'",
        "Curve says, 'I'm just toying with you.'",
        "Curve says, 'You're not fast enough to avoid my sight.'",
        "Curve says, 'Prepare to face your destiny!'",
        "Curve says, 'The timeline favors me!'"
      ],
      "2-3": [
        "Curve strikes twice in quick succession!",
        "Curve's hoverboard blurs, 'The past and present converge.'",
        "Curve's attacks are swift and precise, 'Time is my weapon.'",
        "Curve says, 'Two blows delivered, as foreseen.'",
        "Curve says, 'You're becoming predictable.'",
        "Curve says, 'I'm just getting started.'",
        "Curve says, 'You're too slow to react to my foresight.'",
        "Curve says, 'Feel the weight of inevitability!'",
        "Curve says, 'Prepare to be erased from the timeline!'",
        "Curve says, 'The future is mine to control!'"
      ],
      "4-5": [
        "A series of hits from Curve!",
        "Curve's attacks are relentless, 'The flow of time is on my side.'",
        "Curve's form shifts, 'You cannot escape what is written.'",
        "Curve says, 'You're getting overwhelmed, aren't you?'",
        "Curve says, 'I'm just showing you a glimpse of what's to come!'",
        "Curve says, 'You're too easy to read.'",
        "Curve says, 'You can't change your fate.'",
        "Curve says, 'Prepare for a temporal onslaught!'",
        "Curve says, 'Feel the power of precognition!'",
        "Curve says, 'Your destiny is sealed!'"
      ],
      "6-9": [
        "Curve's relentless assault is fierce!",
        "Curve's attacks are like a cascade of future events, 'The past is immutable.'",
        "Curve's power intensifies, 'You cannot alter the timeline.'",
        "Curve says, 'You're getting desperate.'",
        "Curve says, 'I'm about to unleash my full predictive potential!'",
        "Curve says, 'You're no match for my temporal awareness.'",
        "Curve says, 'You're gonna feel the full force of time itself!'",
        "Curve says, 'This is the end of your resistance!'",
        "Curve says, 'Prepare to face the master of time!'",
        "Curve says, 'Your time is up!'"
      ],
      "10+": [
        "A devastating barrage from Curve!",
        "Curve unleashes the full force of temporal energy, 'The future is absolute!'",
        "Curve's power reaches its zenith, 'Your fate is sealed!'",
        "Curve's voice reverberates, 'The ErgoSphere is mine to control!'",
        "Curve says, 'You're finished, this is your end!'",
        "Curve says, 'I am the architect of time!'",
        "Curve says, 'You cannot defy destiny!'",
        "Curve says, 'You're about to witness the ultimate temporal power!'",
        "Curve says, 'Prepare to face the inevitable!'",
        "Curve says, 'The end of your timeline is here!'"
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
        "<span class='toggle-dialogue'>CURVE says to Jaybers8: 'Time is on my side, Belkan.'</span>",
        "<span class='toggle-dialogue'>CURVE says to Jaybers8: 'You're a glitch in the timeline, Belkan.'</span>",
        "<span class='toggle-dialogue'>CURVE says to Jaybers8: 'I've calculated every possibility, Belkan.'</span>",
        "<span class='toggle-dialogue'>CURVE says to Jaybers8: 'Your actions are predetermined, Belkan.'</span>",
        "<span class='toggle-dialogue'>CURVE says to Jaybers8: 'You're fighting a losing battle against time, Belkan.'</span>",
        "<span class='toggle-dialogue'>CURVE says to Jaybers8: 'The future is written, and you're not in it, Belkan.'</span>"
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
        "<span class='toggle-dialogue'>CURVE says to FLIGHTx12!: 'Time is on my side, Dilardian.'</span>",
        "<span class='toggle-dialogue'>CURVE says to FLIGHTx12!: 'You're a glitch in the timeline, Dilardian.'</span>",
        "<span class='toggle-dialogue'>CURVE says to FLIGHTx12!: 'I've calculated every possibility, Dilardian.'</span>",
        "<span class='toggle-dialogue'>CURVE says to FLIGHTx12!: 'Your actions are predetermined, Dilardian.'</span>",
        "<span class='toggle-dialogue'>CURVE says to FLIGHTx12!: 'You're fighting a losing battle against time, Dilardian.'</span>",
        "<span class='toggle-dialogue'>CURVE says to FLIGHTx12!: 'The future is written, and you're not in it, Dilardian.'</span>"
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
  { name: "Bennu",
    attackType: "PERCEPTION",
    health: adjustHealthByQuarter(722),
    hitNumbers: [15, 16, 17, 18, 19, 20],
    Rewards: "Spinner gets to pick any available CO-OP game instead of spinning. Player also gains 50 ducats and a random weapon. ",
    Punishment: "{Borracho} Each party member must play on level above the Gig Game requirement during the next weekly Rockband session. Party leader deletes 4 HCMC probabilities. No CO-OP game will be picked this week.",
    imageSrc: "https://i.ibb.co/fVN7Xhdh/Bennu-Ergo-Villian.jpg",
    defeatedImageSrc: "https://static.vecteezy.com/system/resources/thumbnails/023/122/996/small/skull-with-roses-human-skull-in-beautiful-flowers-halloween-images-day-of-the-dead-generative-ai-photo.jpg",
    damageDialogues: {
      zero: [
        "Bennu shrugs off the hit.",
        "Bennu giggles, 'Nice try, flatty.'",
        "Bennu rolls her eyes, 'Whatever.'",
        "Bennu yawns, 'You call that an attack?'",
        "Bennu laughs, 'Do you even lift bro?'",
        "Bennu taunts, 'Come on, show me what you got!'",
        "Bennu says, 'Is that all you got, seriously?'",
        "Bennu smirks, 'You hit like a baby dragon.'",
        "Bennu sighs, 'This is so boring.'",
        "Bennu says, 'I've faced tougher foes in a bar fight.'"
      ],
      "1-20": [
        "Bennu takes a light hit.",
        "Bennu winces, 'Ouch, party foul.'",
        "Bennu stumbles slightly, 'Alright, you got my attention.'",
        "Bennu flicks her tail, 'That tickled more than hurt.'",
        "Bennu mutters, 'Okay, that was a little spicy.'",
        "Bennu says, 'Not bad, but I'm just getting warmed up.'",
        "Bennu says, 'You're lucky I'm not using my full strength.'",
        "Bennu says, 'Alright, alright, you got a lucky shot.'",
        "Bennu says, 'Don't get cocky, it won't happen again.'",
        "Bennu says, 'You're gonna pay for that!'"
      ],
      "21-35": [
        "Bennu grunts from the blow.",
        "Bennu clutches her arm, 'Okay, that's gonna leave a mark.'",
        "Bennu scowls, 'You're harshing my mellow.'",
        "Bennu's wings flutter, 'Getting serious now, huh?'",
        "Bennu says, 'Alright, you're starting to piss me off.'",
        "Bennu says, 'That actually hurt, I'll give you that.'",
        "Bennu says, 'You're messing up my vibe!'",
        "Bennu says, 'You're lucky I'm in a good mood.'",
        "Bennu says, 'Don't think you're winning, this is just foreplay.'",
        "Bennu says, 'You're gonna regret making me angry.'"
      ],
      "36-75": [
        "A strong hit! Bennu feels the impact!",
        "Bennu gasps, 'Woah, strong hit dude!'",
        "Bennu's scales shimmer, 'Alright, time to bring the heat!'",
        "Bennu snarls, 'You're gonna regret that.'",
        "Bennu says, 'Okay, now you've done it!'",
        "Bennu says, 'That was a good one, but I'm still standing.'",
        "Bennu says, 'You're making me work up a sweat.'",
        "Bennu says, 'You're pushing your luck, chummer.'",
        "Bennu says, 'This is getting interesting, but I'm still gonna win.'",
        "Bennu says, 'Prepare to feel my wrath!'"
      ],
      "76-99": [
        "Bennu is shaken by the force!",
        "Bennu staggers back, 'Damn, you hit like a truck!'",
        "Bennu's eyes flash, 'This party's over, pal.'",
        "Bennu roars, 'You're pushing your luck!'",
        "Bennu says, 'Okay, you're strong, but I'm stronger!'",
        "Bennu says, 'That was a close one, but I'm not going down yet.'",
        "Bennu says, 'You're making me use my big girl voice!'",
        "Bennu says, 'You're about to get dragon-punched!'",
        "Bennu says, 'This is the last time you hit me that hard!'",
        "Bennu says, 'You're gonna feel the full force of my power!'"
      ],
      "100+": [
        "A powerful strike! Bennu staggers.",
        "Bennu collapses, 'Okay, okay, you win... for now.'",
        "Bennu's form flickers, 'I'll get you for this!'",
        "Bennu growls weakly, 'Party's over...'",
        "Bennu says, 'I can't believe this is happening!'",
        "Bennu says, 'You're too strong for me, but I'll be back!'",
        "Bennu says, 'I'm out of here, this isn't worth it!'",
        "Bennu says, 'You may have won this battle, but the war isn't over!'",
        "Bennu says, 'I'm retreating, but I'll come back stronger!'",
        "Bennu says, 'This isn't the end, it's just a temporary setback!'"
      ]
    },
    hitDialogues: {
      "1": [
        "Bennu lands a precise hit.",
        "Bennu smirks, 'Beginner's luck.'",
        "Bennu's tail whips out, 'Too slow!'",
        "Bennu's eyes gleam, 'Gotcha!'",
        "Bennu singes your hair 'Oops sorry not sorry' ",
        "Bennu says, 'First blood goes to me!'",
        "Bennu says, 'You're not even trying!'",
        "Bennu says, 'I'm just playing with you.'",
        "Bennu says, 'You're no match for my speed.'",
        "Bennu says, 'Prepare to be roasted!'"
      ],
      "2-3": [
        "Bennu strikes twice in quick succession!",
        "Bennu's claws rake across you, 'Double the fun!'",
        "Bennu's wings buffet you, 'Can't keep up?'",
        "Bennu's tail smacks you then she laughs 'Did that sting'",
        "Bennu's hits you with a fireball 'Hot Hot Hot!'",
        "Bennu says, 'Two for the price of one!'",
        "Bennu says, 'You're getting sloppy.'",
        "Bennu says, 'I'm just warming up.'",
        "Bennu says, 'You're not fast enough to dodge my attacks.'",
        "Bennu says, 'Feel the burn!'"
      ],
      "4-5": [
        "A series of hits from Bennu!",
        "Bennu's attacks are relentless, 'Party's just getting started!'",
        "Bennu's form blurs, 'Where'd I go?'",
        "Bennu's hits you with a barrage of fire and scales 'You're on fire!'",
        "Bennu's wing smacks you knocking you off your feet 'BAM!'",
        "Bennu says, 'You're getting overwhelmed, aren't you?'",
        "Bennu says, 'I'm just getting started!'",
        "Bennu says, 'You're too predictable.'",
        "Bennu says, 'You can't handle my dragon breath.'",
        "Bennu says, 'Prepare for a dragon-sized beatdown!'"
      ],
      "6-9": [
        "Bennu's relentless assault is fierce!",
        "Bennu's claws tear at you, 'Having fun yet?'",
        "Bennu's power intensifies, 'Feel the burn!'",
        "Bennu's fire breath engulfs you 'BBQ TIME!'",
        "Bennu's tail constricts you 'Squeeze Squeeze Squeeze'",
        "Bennu says, 'You're getting desperate.'",
        "Bennu says, 'I'm about to unleash my full power!'",
        "Bennu says, 'You're no match for my dragon strength.'",
        "Bennu says, 'You're gonna feel the heat of a thousand suns!'",
        "Bennu says, 'Prepare for the dragon's fury!'"
      ],
      "10+": [
        "A devastating barrage from Bennu!",
        "Bennu unleashes her full draconic fury!",
        "Bennu's flames sear you, 'Party's over, game over!'",
        "Bennu's roar shatters the air 'THIS IS MY HOUSE!'",
        "Bennu grabs you in her tail and slams you repeatedly into the ground 'Ragdoll Ragdoll Ragdoll'",
        "Bennu says, 'You're finished, this is the end!'",
        "Bennu says, 'I'm the queen of this ErgoSphere!'",
        "Bennu says, 'You can't defeat the dragon!'",
        "Bennu says, 'You're about to witness the ultimate dragon attack!'",
        "Bennu says, 'Prepare to face the dragon's wrath!'"
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
    About: "The Bennu is in battle.",
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
        "<span class='toggle-dialogue'>Bennu says to Jaybers8: 'Look, Belkan, can we just skip this and grab a drink?'</span>",
        "<span class='toggle-dialogue'>Bennu says to Jaybers8: 'I'm about to roast you Belkan'</span>",
        "<span class='toggle-dialogue'>Bennu says to Jaybers8: 'You fight like an old man Belkan'</span>",
        "<span class='toggle-dialogue'>Bennu says to Jaybers8: 'Don't get in my way, Belkan.'</span>",
        "<span class='toggle-dialogue'>Bennu says to Jaybers8: 'You're not invited to my party, Belkan.'</span>",
        "<span class='toggle-dialogue'>Bennu says to Jaybers8: 'This is my turf, Belkan.'</span>"
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
        "<span class='toggle-dialogue'>Bennu says to FLIGHTx12!: 'Look, Dilardian, can we just skip this and grab a drink?'</span>",
        "<span class='toggle-dialogue'>Bennu says to FLIGHTx12!: 'I'm about to roast you Dilardian'</span>",
        "<span class='toggle-dialogue'>Bennu says to FLIGHTx12!: 'You fight like an old man Dilardian'</span>",
        "<span class='toggle-dialogue'>Bennu says to FLIGHTx12!: 'Don't get in my way, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Bennu says to FLIGHTx12!: 'You're not invited to my party, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Bennu says to FLIGHTx12!: 'This is my turf, Dilardian.'</span>"
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
        "Forbearer Tren shrugs off the hit.",
        "Tren's eyes dim, 'Your efforts are meaningless.'",
        "Tren sighs, 'You cannot harm what is already timeless.'",
        "Tren gestures dismissively, 'A flicker of annoyance, nothing more.'",
        "Tren's voice echoes, 'You strike at shadows.'",
        "Tren says, 'You're like a fly buzzing around my head.'",
        "Tren says, 'Your attacks are futile against my ancient power.'",
        "Tren says, 'I've endured far worse than this.'",
        "Tren says, 'You're wasting your energy.'",
        "Tren says, 'I am beyond your reach.'"
      ],
      "1-20": [
        "Forbearer Tren takes a light hit.",
        "Tren's brow furrows, 'A momentary sting.'",
        "Tren murmurs, 'The pain is... familiar.'",
        "Tren's staff trembles slightly, 'You have pierced the veil.'",
        "Tren says, 'A small wound, but it will not deter me.'",
        "Tren says, 'You've managed to scratch the surface.'",
        "Tren says, 'This is a mere setback.'",
        "Tren says, 'I've felt worse from a papercut.'",
        "Tren says, 'You're not even trying.'",
        "Tren says, 'You're gonna pay for that!'"
      ],
      "21-35": [
        "Forbearer Tren grunts from the blow.",
        "Tren's voice cracks, 'The past echoes with your strike.'",
        "Tren's gaze hardens, 'You have drawn my ire.'",
        "Tren's cloak ripples, 'The ErgoSphere itself trembles.'",
        "Tren says, 'You've managed to wound me.'",
        "Tren says, 'That actually hurt, I'll give you that.'",
        "Tren says, 'You're starting to get annoying.'",
        "Tren says, 'You're lucky I'm feeling generous.'",
        "Tren says, 'Don't think you're winning, this is just a scratch.'",
        "Tren says, 'You're gonna regret this!'"
      ],
      "36-75": [
        "A strong hit! Forbearer Tren feels the impact!",
        "Tren's eyes flash, 'The memories burn with your attack.'",
        "Tren's form flickers, 'You dare disrupt the flow?'",
        "Tren's voice booms, 'The ErgoSphere cries out in pain!'",
        "Tren says, 'Okay, now you've done it!'",
        "Tren says, 'That was a good one, but I'm still standing.'",
        "Tren says, 'You're making me use my ancient knowledge.'",
        "Tren says, 'You're pushing your luck, little one.'",
        "Tren says, 'This is getting interesting, but I'm still gonna win.'",
        "Tren says, 'Prepare to face the consequences!'"
      ],
      "76-99": [
        "Forbearer Tren is shaken by the force!",
        "Tren's body convulses, 'The ages tremble before your might.'",
        "Tren's staff glows with power, 'You have disturbed the balance!'",
        "Tren's voice resonates, 'The ErgoSphere itself is in turmoil!'",
        "Tren says, 'Okay, you're strong, but I'm stronger!'",
        "Tren says, 'That was a close one, but I'm not going down yet.'",
        "Tren says, 'You're making me use my full strength.'",
        "Tren says, 'You're about to face my ancient fury!'",
        "Tren says, 'This is the last time you hit me that hard!'",
        "Tren says, 'You're gonna feel the full force of the ErgoSphere!'"
      ],
      "100+": [
        "A powerful strike! Forbearer Tren staggers.",
        "Tren collapses, 'The cycle... it ends here?'",
        "Tren's form shimmers, 'The ErgoSphere... it rejects you.'",
        "Tren's voice fades, 'The flow... it ceases...'",
        "Tren says, 'I can't believe this is happening!'",
        "Tren says, 'You're too powerful for me, but I'll be back!'",
        "Tren says, 'I'm out of here, this isn't worth it!'",
        "Tren says, 'You may have won this battle, but the war isn't over!'",
        "Tren says, 'I'm retreating, but I'll come back stronger!'",
        "Tren says, 'This isn't the end, it's just a temporary setback!'"
      ]
    },
    hitDialogues: {
      "1": [
        "Forbearer Tren lands a precise hit.",
        "Tren's staff crackles with energy, 'The past strikes with me.'",
        "Tren's eyes gleam with ancient knowledge, 'You are but a fleeting moment.'",
        "Tren's voice whispers, 'The flow guides my hand.'",
        "Tren says, 'A taste of eternity!'",
        "Tren says, 'First blood goes to the ancients!'",
        "Tren says, 'You're not even a challenge!'",
        "Tren says, 'I'm just testing your resolve.'",
        "Tren says, 'You're no match for my wisdom.'",
        "Tren says, 'Prepare to face the ages!'"
      ],
      "2-3": [
        "Forbearer Tren strikes twice in quick succession!",
        "Tren's staff blurs, 'The past and present collide.'",
        "Tren's movements are swift and precise, 'Time is my weapon.'",
        "Tren's voice echoes, 'The flow is relentless.'",
        "Tren says, 'Two for the price of time!'",
        "Tren says, 'You're getting careless.'",
        "Tren says, 'I'm just getting warmed up.'",
        "Tren says, 'You're not quick enough to evade me.'",
        "Tren says, 'Feel the weight of history!'",
        "Tren says, 'Prepare to be erased!'"
      ],
      "4-5": [
        "A series of hits from Forbearer Tren!",
        "Tren's staff unleashes a barrage of energy, 'The flow is unyielding.'",
        "Tren's form flickers, 'You cannot grasp the depths of time.'",
        "Tren's voice resonates, 'The ErgoSphere itself is my ally.'",
        "Tren says, 'You're getting overwhelmed, aren't you?'",
        "Tren says, 'I'm just beginning to fight!'",
        "Tren says, 'You're too predictable.'",
        "Tren says, 'You can't withstand the power of the ages.'",
        "Tren says, 'Prepare for an ancient onslaught!'",
        "Tren says, 'Feel the power of time!'"
      ],
      "6-9": [
        "Forbearer Tren's relentless assault is fierce!",
        "Tren's staff crackles with ancient magic, 'The past is unforgiving.'",
        "Tren's power intensifies, 'You cannot control the flow.'",
        "Tren's voice booms, 'The ErgoSphere's fury is upon you!'",
        "Tren says, 'You're getting desperate.'",
        "Tren says, 'I'm about to unleash my full potential!'",
        "Tren says, 'You're no match for my ancient might.'",
        "Tren says, 'You're gonna feel the force of time itself!'",
        "Tren says, 'This is the end of the line!'",
        "Tren says, 'Prepare to face the ancient one!'"
      ],
      "10+": [
        "A devastating barrage from Forbearer Tren!",
        "Tren unleashes the full power of the ErgoSphere, 'The flow consumes all!'",
        "Tren's staff glows with blinding light, 'Your time is over!'",
        "Tren's voice shatters the air, 'The ErgoSphere claims you!'",
        "Tren says, 'You're finished, this is your end!'",
        "Tren says, 'I am the master of time!'",
        "Tren says, 'You cannot defeat the ages!'",
        "Tren says, 'You're about to witness the ultimate power!'",
        "Tren says, 'Prepare to face the ancient one!'",
        "Tren says, 'The end is here!'"
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
        "<span class='toggle-dialogue'>Forebearer Tren says to Jaybers8: 'I offer you a choice, Belkan: Yield, or be lost.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to Jaybers8: 'You remind me of a forgotten age, Belkan.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to Jaybers8: 'Your efforts are but ripples in the flow of time, Belkan.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to Jaybers8: 'The ErgoSphere whispers of your insignificance, Belkan.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to Jaybers8: 'You are a mere echo in the corridors of time, Belkan.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to Jaybers8: 'The past will devour you, Belkan.'</span>"
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
        "<span class='toggle-dialogue'>Forebearer Tren says to FLIGHTx12!: 'I offer you a choice, Dilardian: Yield, or be lost.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to FLIGHTx12!: 'You remind me of a forgotten age, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to FLIGHTx12!: 'Your efforts are but ripples in the flow of time, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to FLIGHTx12!: 'The ErgoSphere whispers of your insignificance, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to FLIGHTx12!: 'You are a mere echo in the corridors of time, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Forebearer Tren says to FLIGHTx12!: 'The past will devour you, Dilardian.'</span>"
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
        "Tash-Nadia shrugs off the hit.",
        "Tash-Nadia's eyes gleam, 'You fight like a guppy.'",
        "Tash-Nadia laughs, 'Your strength is but a ripple.'",
        "Tash-Nadia's armor deflects your blow, 'Pathetic.'",
        "Tash-Nadia says, 'You think that can stop me?'",
        "Tash-Nadia says, 'I have withstood the crushing depths, you cannot harm me.'",
        "Tash-Nadia says, 'You fight like a landlubber.'",
        "Tash-Nadia says, 'Your attacks are as weak as the tide.'",
        "Tash-Nadia says, 'Feel the pressure of my rage!'",
        "Tash-Nadia says, 'You cannot defeat the ocean's fury!'"
      ],
      "1-20": [
        "Tash-Nadia takes a light hit.",
        "Tash-Nadia winces, 'A mere scratch.'",
        "Tash-Nadia's gills flare, 'Annoying, surface dweller.'",
        "Tash-Nadia's armor hisses, 'You dare pierce my hide?'",
        "Tash-Nadia says, 'A small wound, but it will not deter me.'",
        "Tash-Nadia says, 'You've managed to make me flinch.'",
        "Tash-Nadia says, 'This is just a flesh wound.'",
        "Tash-Nadia says, 'I've endured far worse than this.'",
        "Tash-Nadia says, 'You're just scratching the scales.'",
        "Tash-Nadia says, 'You're gonna pay for that!'"
      ],
      "21-35": [
        "Tash-Nadia grunts from the blow.",
        "Tash-Nadia's voice rumbles, 'The abyss echoes with your strike.'",
        "Tash-Nadia's webbed hands clench, 'You have drawn my wrath.'",
        "Tash-Nadia's armor groans, 'The pressure intensifies.'",
        "Tash-Nadia says, 'You've managed to wound me.'",
        "Tash-Nadia says, 'That actually hurt, I'll give you that.'",
        "Tash-Nadia says, 'You're starting to get on my nerves.'",
        "Tash-Nadia says, 'You're lucky I'm feeling merciful.'",
        "Tash-Nadia says, 'Don't think you're winning, this is just a taste of my power.'",
        "Tash-Nadia says, 'You're gonna regret making me angry!'"
      ],
      "36-75": [
        "A strong hit! Tash-Nadia feels the impact!",
        "Tash-Nadia's eyes burn, 'The deeps boil with your attack.'",
        "Tash-Nadia's form flickers, 'You dare disrupt the ancient ones?'",
        "Tash-Nadia's voice booms, 'The ocean trembles with my rage!'",
        "Tash-Nadia says, 'Okay, now you've done it!'",
        "Tash-Nadia says, 'That was a good one, but I'm still standing.'",
        "Tash-Nadia says, 'You're making me exert myself.'",
        "Tash-Nadia says, 'You're pushing your luck, surface creature.'",
        "Tash-Nadia says, 'This is getting interesting, but I'm still gonna win.'",
        "Tash-Nadia says, 'Prepare to feel the ocean's fury!'"
      ],
      "76-99": [
        "Tash-Nadia is shaken by the force!",
        "Tash-Nadia's body convulses, 'The tides rage before your might.'",
        "Tash-Nadia's armor cracks, 'You have disturbed the ancient balance!'",
        "Tash-Nadia's voice resonates, 'The ErgoSphere itself is in turmoil!'",
        "Tash-Nadia says, 'Okay, you're strong, but I'm stronger!'",
        "Tash-Nadia says, 'That was a close one, but I'm not going down yet.'",
        "Tash-Nadia says, 'You're making me use my full strength.'",
        "Tash-Nadia says, 'You're about to face my true form!'",
        "Tash-Nadia says, 'This is the last time you hit me that hard!'",
        "Tash-Nadia says, 'You're gonna feel the full force of the abyss!'"
      ],
      "100+": [
        "A powerful strike! Tash-Nadia staggers.",
        "Tash-Nadia collapses, 'The depths... they reclaim me?'",
        "Tash-Nadia's form shimmers, 'The ErgoSphere... it rejects you.'",
        "Tash-Nadia's voice fades, 'The currents... they pull me under...'",
        "Tash-Nadia says, 'I can't believe this is happening!'",
        "Tash-Nadia says, 'You're too powerful for me, but I'll be back!'",
        "Tash-Nadia says, 'I'm out of here, this isn't worth it!'",
        "Tash-Nadia says, 'You may have won this battle, but the war isn't over!'",
        "Tash-Nadia says, 'I'm retreating, but I'll come back stronger!'",
        "Tash-Nadia says, 'This isn't the end, it's just a temporary setback!'"
      ]
    },
    hitDialogues: {
      "1": [
        "Tash-Nadia lands a precise hit.",
        "Tash-Nadia's trident strikes with the force of a tidal wave, 'The deeps strike with me.'",
        "Tash-Nadia's eyes gleam with ancient power, 'You are but a speck in the ocean.'",
        "Tash-Nadia's voice whispers, 'The currents guide my hand.'",
        "Tash-Nadia says, 'A taste of the abyss!'",
        "Tash-Nadia says, 'First blood goes to the deep!'",
        "Tash-Nadia says, 'You're not even a challenge!'",
        "Tash-Nadia says, 'I'm just testing your mettle.'",
        "Tash-Nadia says, 'You're no match for my aquatic strength.'",
        "Tash-Nadia says, 'Prepare to be dragged into the depths!'"
      ],
      "2-3": [
        "Tash-Nadia strikes twice in quick succession!",
        "Tash-Nadia's trident blurs, 'The past and present collide in the ocean.'",
        "Tash-Nadia's movements are swift and precise, 'Water is my weapon.'",
        "Tash-Nadia's voice echoes, 'The tides are relentless.'",
        "Tash-Nadia says, 'Two for the price of the sea!'",
        "Tash-Nadia says, 'You're getting careless.'",
        "Tash-Nadia says, 'I'm just warming up.'",
        "Tash-Nadia says, 'You're not quick enough to evade me.'",
        "Tash-Nadia says, 'Feel the wrath of the ocean!'",
        "Tash-Nadia says, 'Prepare to be drowned!'"
      ],
      "4-5": [
        "A series of hits from Tash-Nadia!",
        "Tash-Nadia's trident unleashes a barrage of water, 'The ocean is unyielding.'",
        "Tash-Nadia's form flickers, 'You cannot grasp the power of the deep.'",
        "Tash-Nadia's voice resonates, 'The ErgoSphere itself is my ally.'",
        "Tash-Nadia says, 'You're getting overwhelmed, aren't you?'",
        "Tash-Nadia says, 'I'm just beginning to fight!'",
        "Tash-Nadia says, 'You're too predictable.'",
        "Tash-Nadia says, 'You can't withstand the crushing pressure.'",
        "Tash-Nadia says, 'Prepare for an aquatic assault!'",
        "Tash-Nadia says, 'Feel the power of the tides!'"
      ],
      "6-9": [
        "Tash-Nadia's relentless assault is fierce!",
        "Tash-Nadia's trident crackles with ancient magic, 'The deeps are unforgiving.'",
        "Tash-Nadia's power intensifies, 'You cannot control the currents.'",
        "Tash-Nadia's voice booms, 'The ErgoSphere's fury is upon you!'",
        "Tash-Nadia says, 'You're getting desperate.'",
        "Tash-Nadia says, 'I'm about to unleash my full potential!'",
        "Tash-Nadia says, 'You're no match for my aquatic might.'",
        "Tash-Nadia says, 'You're gonna feel the force of the ocean itself!'",
        "Tash-Nadia says, 'This is the end of the line!'",
        "Tash-Nadia says, 'Prepare to face the ancient one!'"
      ],
      "10+": [
        "A devastating barrage from Tash-Nadia!",
        "Tash-Nadia unleashes the full power of the ErgoSphere, 'The ocean consumes all!'",
        "Tash-Nadia's trident glows with blinding light, 'Your time is over!'",
        "Tash-Nadia's voice shatters the air, 'The ErgoSphere claims you!'",
        "Tash-Nadia says, 'You're finished, this is your end!'",
        "Tash-Nadia says, 'I am the master of the seas!'",
        "Tash-Nadia says, 'You cannot defeat the depths!'",
        "Tash-Nadia says, 'You're about to witness the ultimate power!'",
        "Tash-Nadia says, 'Prepare to face the ancient one!'",
        "Tash-Nadia says, 'The end is here!'"
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
        "<span class='toggle-dialogue'>Tash Nadia says to Jaybers8: 'You will drown in the ErgoSphere, Belkan.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to Jaybers8: 'You are but a ripple in my ocean, Belkan.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to Jaybers8: 'The ancient ones stir in the depths, Belkan.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to Jaybers8: 'The ErgoSphere is my domain, Belkan.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to Jaybers8: 'Your strength is as fleeting as seafoam, Belkan.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to Jaybers8: 'The ocean's heart beats within me, Belkan.'</span>"
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
        "<span class='toggle-dialogue'>Tash Nadia says to FLIGHTx12!: 'You will drown in the ErgoSphere, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to FLIGHTx12!: 'You are but a ripple in my ocean, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to FLIGHTx12!: 'The ancient ones stir in the depths, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to FLIGHTx12!: 'The ErgoSphere is my domain, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to FLIGHTx12!: 'Your strength is as fleeting as seafoam, Dilardian.'</span>",
        "<span class='toggle-dialogue'>Tash Nadia says to FLIGHTx12!: 'The ocean's heart beats within me, Dilardian.'</span>"
      ]
    }
  },
];
