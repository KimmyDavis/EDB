export const orderOfMass = {
  english: {
    introductoryRites: {
      signOfTheCross: {
        type: ["rite"],
        instruction: "All make the Sign of the Cross as the Priest says",
        priest:
          "In the name of the Father, and of the Son, and of the Holy Spirit.",
        response: "Amen.",
        notes: "",
      },
      greeting: {
        type: ["rite"],
        instruction: "The Priest greets the people",
        priest: "The Lord be with you.",
        response: "And with your spirit.",
        notes: "Other forms of greeting may be used.",
      },
      penitentialAct: {
        type: ["prayer"],
        instruction:
          "The Priest invites the faithful to acknowledge their sins",
        priest: "Have mercy on us, O Lord.",
        response: "For we have sinned against you.",
        notes:
          "Different forms of the Penitential Act may be used including the Confiteor or Kyrie.",
      },
      gloria: {
        type: ["song", "prayer"],
        instruction: "All recite or sing the Gloria when indicated",
        priest: "Glory to God in the highest...",
        response: "Amen.",
        notes: "Omitted during Advent and Lent.",
        body: "Glory to God in the highest, and on earth peace to people of good will. We praise you, we bless you, we adore you, we glorify you, we give you thanks for your great glory, Lord God, heavenly King, O God, almighty Father. Lord Jesus Christ, Only Begotten Son, Lord God, Lamb of God, Son of the Father, you take away the sins of the world, have mercy on us; you take away the sins of the world, receive our prayer; you are seated at the right hand of the Father, have mercy on us. For you alone are the Holy One, you alone are the Lord, you alone are the Most High, Jesus Christ, with the Holy Spirit, in the glory of God the Father. Amen.",
      },
      collect: {
        type: ["prayer"],
        instruction: "The Priest invites all to pray",
        priest: "Let us pray.",
        response: "Amen.",
        notes: "Followed by the Collect prayer.",
      },
    },
    liturgyOfTheWord: {
      firstReading: {
        type: ["rite"],
        instruction: "The reader proclaims the first reading",
        priest: "The word of the Lord.",
        response: "Thanks be to God.",
        notes: "",
      },
      psalm: {
        type: ["song"],
        instruction: "The Psalm is sung or recited",
        priest: "",
        response: "Responsorial response by the people.",
        notes: "",
      },
      gospel: {
        type: ["rite"],
        instruction: "All stand for the Gospel",
        priest:
          "The Lord be with you. A reading from the holy Gospel according to N.",
        response: "And with your spirit. Glory to you, O Lord.",
        notes: "At the end: 'Praise to you, Lord Jesus Christ.'",
      },
      creed: {
        type: ["prayer"],
        instruction: "All profess the Nicene Creed",
        priest: "",
        response: "Amen.",
        notes: "Apostles' Creed may be used alternatively.",
        body: "I believe in one God, the Father almighty, maker of heaven and earth, of all things visible and invisible. I believe in one Lord Jesus Christ, the Only Begotten Son of God, born of the Father before all ages. God from God, Light from Light, true God from true God, begotten, not made, consubstantial with the Father; through him all things were made. For us men and for our salvation he came down from heaven, and by the Holy Spirit was incarnate of the Virgin Mary, and became man. For our sake he was crucified under Pontius Pilate, he suffered death and was buried, and rose again on the third day in accordance with the Scriptures. He ascended into heaven and is seated at the right hand of the Father. He will come again in glory to judge the living and the dead and his kingdom will have no end. I believe in the Holy Spirit, the Lord, the giver of life, who proceeds from the Father and the Son, who with the Father and the Son is adored and glorified, who has spoken through the prophets. I believe in one, holy, catholic and apostolic Church. I confess one Baptism for the forgiveness of sins and I look forward to the resurrection of the dead and the life of the world to come. Amen.",
      },
      prayerOfTheFaithful: {
        type: ["prayer"],
        instruction: "Intercessions are offered",
        priest: "Lord, in your mercy.",
        response: "Hear our prayer.",
        notes: "",
      },
    },
    liturgyOfTheEucharist: {
      offertory: {
        type: ["rite"],
        instruction: "Gifts are brought to the altar",
        priest: "Blessed be God for ever.",
        response: "Blessed be God for ever.",
        notes: "",
      },
      eucharisticPrayer: {
        type: ["prayer"],
        instruction: "The Priest offers the Eucharistic Prayer",
        priest: "The Lord be with you. Lift up your hearts.",
        response: "And with your spirit. We lift them up to the Lord.",
        notes: "Includes Preface, Sanctus, Consecration, and Doxology.",
        body: {
          prefaceDialogue: {
            priest:
              "The Lord be with you. Lift up your hearts. Let us give thanks to the Lord our God.",
            response:
              "And with your spirit. We lift them up to the Lord. It is right and just.",
          },
          sanctus:
            "Holy, Holy, Holy Lord God of hosts. Heaven and earth are full of your glory. Hosanna in the highest. Blessed is he who comes in the name of the Lord. Hosanna in the highest.",
          mysteryOfFaith: {
            priest: "The mystery of faith.",
            responseOptions: [
              "We proclaim your Death, O Lord, and profess your Resurrection until you come again.",
              "When we eat this Bread and drink this Cup, we proclaim your Death, O Lord, until you come again.",
              "Save us, Saviour of the world, for by your Cross and Resurrection you have set us free.",
            ],
          },
          doxology: {
            priest:
              "Through him, and with him, and in him, O God, almighty Father, in the unity of the Holy Spirit, all glory and honour is yours, for ever and ever.",
            response: "Amen.",
          },
        },
      },
      communionRite: {
        lordsPrayer: {
          type: ["prayer"],
          instruction: "All pray the Lord’s Prayer",
          priest:
            "At the Saviour’s command and formed by divine teaching, we dare to say:",
          response: "",
          notes: "",
          body: "Our Father, who art in heaven, hallowed be thy name; thy kingdom come, thy will be done on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil.",
        },
        signOfPeace: {
          type: ["rite"],
          instruction: "The faithful offer each other a sign of peace",
          priest: "The peace of the Lord be with you always.",
          response: "And with your spirit.",
          notes: "",
        },
        lambOfGod: {
          type: ["song", "prayer"],
          instruction: "The Lamb of God is sung or said",
          priest: "",
          response: "Lamb of God, you take away the sins of the world...",
          notes: "",
        },
        communion: {
          type: ["rite"],
          instruction: "The faithful receive Communion",
          priest: "The Body of Christ.",
          response: "Amen.",
          notes: "",
        },
      },
    },
    concludingRites: {
      blessing: {
        type: ["rite"],
        instruction: "The Priest blesses the people",
        priest:
          "May almighty God bless you, the Father, and the Son, and the Holy Spirit.",
        response: "Amen.",
        notes: "",
      },
      dismissal: {
        type: ["rite"],
        instruction: "The people are sent forth",
        priest: "Go forth, the Mass is ended.",
        response: "Thanks be to God.",
        notes: "Other dismissal formulas may be used.",
      },
    },
  },

  french: {
    introductoryRites: {
      signOfTheCross: {
        type: ["rite"],
        instruction:
          "Tous font le signe de la croix pendant que le prêtre parle",
        priest: "Au nom du Père, et du Fils, et du Saint-Esprit.",
        response: "Amen.",
        notes: "",
      },
      greeting: {
        type: ["rite"],
        instruction: "Le prêtre salue le peuple",
        priest: "Le Seigneur soit avec vous.",
        response: "Et avec votre esprit.",
        notes: "D'autres formules peuvent être utilisées.",
      },
      penitentialAct: {
        type: ["prayer"],
        instruction: "Le prêtre invite les fidèles à reconnaître leurs péchés",
        priest: "Prends pitié de nous, Seigneur.",
        response: "Nous avons péché contre toi.",
        notes: "Différentes formes peuvent être utilisées (Confiteor, Kyrie).",
      },
      gloria: {
        type: ["song", "prayer"],
        instruction: "Tous chantent ou récitent le Gloria",
        priest: "Gloire à Dieu au plus haut des cieux...",
        response: "Amen.",
        notes: "Omis pendant l’Avent et le Carême.",
        body: "Gloire à Dieu au plus haut des cieux, et paix sur la terre aux hommes qu’il aime. Nous te louons, nous te bénissons, nous t’adorons, nous te glorifions, nous te rendons grâce pour ton immense gloire, Seigneur Dieu, Roi du ciel, Dieu le Père tout-puissant. Seigneur Fils unique, Jésus Christ, Seigneur Dieu, Agneau de Dieu, le Fils du Père ; toi qui enlèves le péché du monde, prends pitié de nous ; toi qui enlèves le péché du monde, reçois notre prière ; toi qui es assis à la droite du Père, prends pitié de nous. Car toi seul es saint, toi seul es Seigneur, toi seul es le Très-Haut : Jésus Christ, avec le Saint-Esprit dans la gloire de Dieu le Père. Amen.",
      },
      collect: {
        type: ["prayer"],
        instruction: "Le prêtre invite à la prière",
        priest: "Prions le Seigneur.",
        response: "Amen.",
        notes: "",
      },
    },
    liturgyOfTheWord: {
      firstReading: {
        type: ["rite"],
        instruction: "Le lecteur proclame la première lecture",
        priest: "Parole du Seigneur.",
        response: "Nous rendons grâce à Dieu.",
        notes: "",
      },
      psalm: {
        type: ["song"],
        instruction: "Le psaume est chanté ou récité",
        priest: "",
        response: "Réponse du psaume par l’assemblée.",
        notes: "",
      },
      gospel: {
        type: ["rite"],
        instruction: "Tous se lèvent pour l’Évangile",
        priest: "Le Seigneur soit avec vous. Évangile de Jésus Christ selon N.",
        response: "Et avec votre esprit. Gloire à toi, Seigneur.",
        notes: "À la fin : « Louange à toi, Seigneur Jésus. »",
      },
      creed: {
        type: ["prayer"],
        instruction: "Profession de foi",
        priest: "",
        response: "Amen.",
        notes: "",
        body: "Je crois en un seul Dieu, le Père tout-puissant, créateur du ciel et de la terre, de l’univers visible et invisible. Je crois en un seul Seigneur, Jésus Christ, le Fils unique de Dieu, né du Père avant tous les siècles : il est Dieu, né de Dieu, lumière, née de la lumière, vrai Dieu, né du vrai Dieu, engendré, non pas créé, consubstantiel au Père ; et par lui tout a été fait. Pour nous les hommes, et pour notre salut, il descendit du ciel ; par l’Esprit Saint, il a pris chair de la Vierge Marie, et s’est fait homme. Crucifié pour nous sous Ponce Pilate, il souffrit sa passion et fut mis au tombeau. Il ressuscita le troisième jour, conformément aux Écritures, et il monta au ciel ; il est assis à la droite du Père. Il reviendra dans la gloire, pour juger les vivants et les morts ; et son règne n’aura pas de fin. Je crois en l’Esprit Saint, qui est Seigneur et qui donne la vie ; il procède du Père et du Fils ; avec le Père et le Fils, il reçoit même adoration et même gloire ; il a parlé par les prophètes. Je crois en l’Église, une, sainte, catholique et apostolique. Je reconnais un seul baptême pour le pardon des péchés. J’attends la résurrection des morts, et la vie du monde à venir. Amen.",
      },
      prayerOfTheFaithful: {
        type: ["prayer"],
        instruction: "Prière universelle",
        priest: "Seigneur, nous te prions.",
        response: "Exauce-nous.",
        notes: "",
      },
    },
    liturgyOfTheEucharist: {
      offertory: {
        type: ["rite"],
        instruction: "Présentation des dons",
        priest: "Béni soit Dieu, maintenant et toujours.",
        response: "Béni soit Dieu, maintenant et toujours.",
        notes: "",
      },
      eucharisticPrayer: {
        type: ["prayer"],
        instruction: "Prière eucharistique",
        priest: "Le Seigneur soit avec vous. Élevons notre cœur.",
        response: "Et avec votre esprit. Nous le tournons vers le Seigneur.",
        notes: "",
        body: {
          prefaceDialogue: {
            priest:
              "Le Seigneur soit avec vous. Élevons notre cœur. Rendons grâce au Seigneur notre Dieu.",
            response:
              "Et avec votre esprit. Nous le tournons vers le Seigneur. Cela est juste et bon.",
          },
          sanctus:
            "Saint, Saint, Saint, le Seigneur, Dieu de l’univers ! Le ciel et la terre sont remplis de ta gloire. Hosanna au plus haut des cieux. Béni soit celui qui vient au nom du Seigneur. Hosanna au plus haut des cieux.",
          mysteryOfFaith: {
            priest: "Il est grand, le mystère de la foi :",
            responseOptions: [
              "Nous annonçons ta mort, Seigneur Jésus, nous proclamons ta résurrection, nous attendons ta venue dans la gloire.",
              "Quand nous mangeons ce pain et buvons à cette coupe, nous annonçons ta mort, Seigneur ressuscité.",
              "Sauveur du monde, sauve-nous ! Par ta croix et ta résurrection, tu nous as libérés.",
            ],
          },
          doxology: {
            priest:
              "Par lui, avec lui et en lui, à toi, Dieu le Père tout-puissant, dans l’unité du Saint-Esprit, tout honneur et toute gloire, pour les siècles des siècles.",
            response: "Amen.",
          },
        },
      },
      communionRite: {
        lordsPrayer: {
          type: ["prayer"],
          instruction: "Notre Père",
          priest: "Comme nous l’avons appris du Sauveur, nous osons dire :",
          response: "",
          notes: "",
          body: "Notre Père, qui es aux cieux, que ton nom soit sanctifié, que ton règne vienne, que ta volonté soit faite sur la terre comme au ciel. Donne-nous aujourd’hui notre pain de ce jour. Pardonne-nous nos offenses, comme nous pardonnons aussi à ceux qui nous ont offensés. Et ne nous laisse pas entrer en tentation mais délivre-nous du Mal.",
        },
        signOfPeace: {
          type: ["rite"],
          instruction: "Échange de la paix",
          priest: "Que la paix du Seigneur soit toujours avec vous.",
          response: "Et avec votre esprit.",
          notes: "",
        },
        lambOfGod: {
          type: ["song", "prayer"],
          instruction: "Agneau de Dieu",
          priest: "",
          response: "Agneau de Dieu, qui enlèves le péché du monde...",
          notes: "",
        },
        communion: {
          type: ["rite"],
          instruction: "Communion des fidèles",
          priest: "Le Corps du Christ.",
          response: "Amen.",
          notes: "",
        },
      },
    },
    concludingRites: {
      blessing: {
        type: ["rite"],
        instruction: "Bénédiction finale",
        priest:
          "Que Dieu tout-puissant vous bénisse, le Père, le Fils et le Saint-Esprit.",
        response: "Amen.",
        notes: "",
      },
      dismissal: {
        type: ["rite"],
        instruction: "Envoi",
        priest: "Allez, dans la paix du Christ.",
        response: "Nous rendons grâce à Dieu.",
        notes: "Plusieurs formules possibles.",
      },
    },
  },
};

export const fullOrderOfMass = [
  {
    key: "entrance",
    title: "Entrance",
    kind: "song",
    massField: "entrance",
    detailPath: null,
  },
  {
    key: "signOfTheCross",
    title: "Sign Of The Cross",
    kind: "rite",
    detailPath: ["introductoryRites", "signOfTheCross"],
  },
  {
    key: "greeting",
    title: "Greeting",
    kind: "rite",
    detailPath: ["introductoryRites", "greeting"],
  },
  {
    key: "kyrie",
    title: "Kyrie",
    kind: "song",
    massField: "kyrie",
    detailPath: ["introductoryRites", "penitentialAct"],
  },
  {
    key: "gloria",
    title: "Gloria",
    kind: "song",
    massField: "gloria",
    detailPath: ["introductoryRites", "gloria"],
  },
  {
    key: "collect",
    title: "Collect",
    kind: "prayer",
    detailPath: ["introductoryRites", "collect"],
  },
  {
    key: "firstReading",
    title: "First Reading",
    kind: "rite",
    detailPath: ["liturgyOfTheWord", "firstReading"],
  },
  {
    key: "psalmResponse",
    title: "Psalm Response",
    kind: "song",
    massField: "psalmResponse",
    detailPath: ["liturgyOfTheWord", "psalm"],
  },
  {
    key: "acclamation",
    title: "Acclamation",
    kind: "song",
    massField: "acclamation",
    detailPath: ["liturgyOfTheWord", "gospel"],
  },
  {
    key: "gospelOfThePassion",
    title: "Gospel Of The Passion",
    kind: "reading",
    massField: "gospelOfThePassion",
    detailPath: ["liturgyOfTheWord", "gospel"],
  },
  {
    key: "creed",
    title: "Creed",
    kind: "prayer",
    massField: "creed",
    detailPath: ["liturgyOfTheWord", "creed"],
  },
  {
    key: "petition",
    title: "Petition",
    kind: "song",
    massField: "petition",
    detailPath: ["liturgyOfTheWord", "prayerOfTheFaithful"],
  },
  {
    key: "offertory",
    title: "Offertory",
    kind: "song",
    massField: "offertory",
    detailPath: ["liturgyOfTheEucharist", "offertory"],
  },
  {
    key: "sanctus",
    title: "Sanctus",
    kind: "song",
    massField: "sanctus",
    detailPath: [
      "liturgyOfTheEucharist",
      "eucharisticPrayer",
      "body",
      "sanctus",
    ],
  },
  {
    key: "LordsPrayer",
    title: "Lord's Prayer",
    kind: "prayer",
    massField: "LordsPrayer",
    detailPath: ["liturgyOfTheEucharist", "communionRite", "lordsPrayer"],
  },
  {
    key: "peace",
    title: "Peace",
    kind: "rite",
    massField: "peace",
    detailPath: ["liturgyOfTheEucharist", "communionRite", "signOfPeace"],
  },
  {
    key: "agnusDei",
    title: "Agnus Dei",
    kind: "song",
    massField: "agnusDei",
    detailPath: ["liturgyOfTheEucharist", "communionRite", "lambOfGod"],
  },
  {
    key: "holyCommunion",
    title: "Holy Communion",
    kind: "song",
    massField: "holyCommunion",
    detailPath: ["liturgyOfTheEucharist", "communionRite", "communion"],
  },
  {
    key: "thanksgiving",
    title: "Thanksgiving",
    kind: "song",
    massField: "thanksgiving",
    detailPath: null,
  },
  {
    key: "exit",
    title: "Exit",
    kind: "song",
    massField: "exit",
    detailPath: ["concludingRites", "dismissal"],
  },
];

// type

const orderOfMassSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  required: ["orderOfMass"],
  properties: {
    orderOfMass: {
      type: "object",
      required: ["english", "french"],
      properties: {
        english: { $ref: "#/definitions/massStructure" },
        french: { $ref: "#/definitions/massStructure" },
      },
    },
  },
  definitions: {
    massItem: {
      type: "object",
      required: ["type", "instruction"],
      properties: {
        type: {
          type: "array",
          items: {
            type: "string",
            enum: ["rite", "prayer", "song"],
          },
        },
        instruction: { type: "string" },
        priest: { type: "string" },
        response: { type: "string" },
        notes: { type: "string" },
        body: {
          oneOf: [
            { type: "string" },
            { $ref: "#/definitions/eucharisticPrayerBody" },
          ],
        },
      },
    },
    dialogue: {
      type: "object",
      properties: {
        priest: { type: "string" },
        response: { type: "string" },
        responseOptions: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
    eucharisticPrayerBody: {
      type: "object",
      properties: {
        prefaceDialogue: { $ref: "#/definitions/dialogue" },
        sanctus: { type: "string" },
        mysteryOfFaith: {
          type: "object",
          properties: {
            priest: { type: "string" },
            responseOptions: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
        doxology: { $ref: "#/definitions/dialogue" },
      },
    },
    communionRite: {
      type: "object",
      properties: {
        lordsPrayer: { $ref: "#/definitions/massItem" },
        signOfPeace: { $ref: "#/definitions/massItem" },
        lambOfGod: { $ref: "#/definitions/massItem" },
        communion: { $ref: "#/definitions/massItem" },
      },
    },
    massStructure: {
      type: "object",
      properties: {
        introductoryRites: {
          type: "object",
          additionalProperties: { $ref: "#/definitions/massItem" },
        },
        liturgyOfTheWord: {
          type: "object",
          additionalProperties: { $ref: "#/definitions/massItem" },
        },
        liturgyOfTheEucharist: {
          type: "object",
          properties: {
            offertory: { $ref: "#/definitions/massItem" },
            eucharisticPrayer: { $ref: "#/definitions/massItem" },
            communionRite: { $ref: "#/definitions/communionRite" },
          },
        },
        concludingRites: {
          type: "object",
          additionalProperties: { $ref: "#/definitions/massItem" },
        },
      },
    },
  },
};
