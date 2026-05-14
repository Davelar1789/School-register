// curriculumData.js
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO FILL IN THIS FILE:
//
// Structure:
//   curriculumData[className][subjectName][termNumber] = [ ...rows ]
//
// Each row has 4 fields:
//   { week, subStrand, contentStandards, indicators }
//
// "indicators" can be a plain string or an array of strings.
// If it's an array, each item will appear as a bullet in the table.
//
// Example row:
//   {
//     week: 1,
//     subStrand: "God, His Nature and Attributes",
//     contentStandards: "Explain the nature of God through His attributes in the three major religions",
//     indicators: [
//       "Identify the attributes of God. E.g. omnipotent, omnipresent, omniscient, love, patience",
//       "Discuss how God's attributes are expressed in daily life",
//     ],
//   },
//
// ─────────────────────────────────────────────────────────────────────────────

const curriculumData = {

  // ═══════════════════════════════════════════════════════════════════════════
  // BASIC 1
  // ═══════════════════════════════════════════════════════════════════════════
  "Basic 1": {

    "Mathematics": {
      1: [
        {
          week: 1,
          subStrand: "Counting",
          contentStandards: "Count objects from 1 to 10",
          indicators: ["Count objects accurately up to 10", "Match number to quantity"],
        },
        {
          week: 2,
          subStrand: "Number Recognition",
          contentStandards: "Recognise and write numbers 1–10",
          indicators: ["Identify numerals 1–10", "Trace and write numerals 1–10"],
        },
        // ADD MORE ROWS HERE...
      ],
      2: [
        {
          week: 1,
          subStrand: "Addition",
          contentStandards: "Add numbers within 20",
          indicators: ["Use objects to add two groups", "Write addition sentences"],
        },
        // ADD MORE ROWS HERE...
      ],
      3: [
        {
          week: 1,
          subStrand: "Subtraction",
          contentStandards: "Subtract numbers within 20",
          indicators: ["Use objects to subtract", "Write subtraction sentences"],
        },
        // ADD MORE ROWS HERE...
      ],
    },

    "English Language": {
      1: [
        {
          week: 1,
          subStrand: "Listening and Speaking",
          contentStandards: "Listen attentively and respond to simple instructions",
          indicators: ["Follow 1-step oral instructions", "Respond verbally to greetings"],
        },
        // ADD MORE ROWS HERE...
      ],
      2: [
        {
          week: 1,
          subStrand: "Reading",
          contentStandards: "Read simple words and sentences aloud",
          indicators: ["Identify letters of the alphabet", "Blend consonant-vowel-consonant words"],
        },
        // ADD MORE ROWS HERE...
      ],
      3: [
        {
          week: 1,
          subStrand: "Writing",
          contentStandards: "Write letters and simple words correctly",
          indicators: ["Write upper and lower case letters", "Copy simple words from the board"],
        },
        // ADD MORE ROWS HERE...
      ],
    },

    "Science": {
      1: [
        {
          week: 1,
          subStrand: "Living and Non-Living Things",
          contentStandards: "Distinguish between living and non-living things",
          indicators: ["List examples of living things", "List examples of non-living things", "State two differences between living and non-living things"],
        },
        // ADD MORE ROWS HERE...
      ],
      2: [
        {
          week: 1,
          subStrand: "The Human Body",
          contentStandards: "Identify and name parts of the human body",
          indicators: ["Name at least 5 body parts", "State the function of each named body part"],
        },
        // ADD MORE ROWS HERE...
      ],
      3: [
        {
          week: 1,
          subStrand: "Plants",
          contentStandards: "Identify parts of a plant",
          indicators: ["Name the root, stem, leaf, flower, fruit", "State the function of roots and leaves"],
        },
        // ADD MORE ROWS HERE...
      ],
    },

    "Our World Our People (OWOP)": {
      1: [
        {
          week: 1,
          subStrand: "The Family",
          contentStandards: "Describe the family and its members",
          indicators: ["Name members of the immediate family", "State the roles of family members"],
        },
        // ADD MORE ROWS HERE...
      ],
      2: [
        {
          week: 1,
          subStrand: "The School",
          contentStandards: "Identify the school environment and its workers",
          indicators: ["Name school workers and their duties", "Describe facilities in the school"],
        },
        // ADD MORE ROWS HERE...
      ],
      3: [
        {
          week: 1,
          subStrand: "The Community",
          contentStandards: "Describe the community and community helpers",
          indicators: ["Name community helpers", "Explain how community helpers serve the community"],
        },
        // ADD MORE ROWS HERE...
      ],
    },

    "Religious and Moral Education (RME)": {
      1: [
        {
          week: 1,
          subStrand: "God, Our Creator",
          contentStandards: "Acknowledge God as the creator of all things",
          indicators: ["State what God created", "Express gratitude to God for creation"],
        },
        // ADD MORE ROWS HERE...
      ],
      2: [
        {
          week: 1,
          subStrand: "Moral Values",
          contentStandards: "Identify basic moral values",
          indicators: ["Name moral values such as honesty, respect, kindness", "Give examples of these values in daily life"],
        },
        // ADD MORE ROWS HERE...
      ],
      3: [
        {
          week: 1,
          subStrand: "Religious Celebrations",
          contentStandards: "Describe religious celebrations in the community",
          indicators: ["Name celebrations in Christianity, Islam, and Traditional religion", "State the significance of each celebration"],
        },
        // ADD MORE ROWS HERE...
      ],
    },

    "Creative Arts": {
      1: [
        {
          week: 1,
          subStrand: "Drawing",
          contentStandards: "Draw simple shapes and objects",
          indicators: ["Draw basic shapes: circle, square, triangle", "Draw objects found in the home"],
        },
        // ADD MORE ROWS HERE...
      ],
      2: [
        {
          week: 1,
          subStrand: "Music",
          contentStandards: "Sing simple songs with correct rhythm",
          indicators: ["Sing at least 2 Ghanaian folk songs", "Clap to the beat of songs"],
        },
        // ADD MORE ROWS HERE...
      ],
      3: [
        {
          week: 1,
          subStrand: "Craft",
          contentStandards: "Create simple crafts using local materials",
          indicators: ["Use clay or paper to make simple objects", "Describe what was made"],
        },
        // ADD MORE ROWS HERE...
      ],
    },

    "Ghanaian Language": {
      1: [
        {
          week: 1,
          subStrand: "Oral Language",
          contentStandards: "Communicate in the Ghanaian language",
          indicators: ["Greet in the Ghanaian language", "Introduce themselves in the Ghanaian language"],
        },
        // ADD MORE ROWS HERE...
      ],
      2: [
        {
          week: 1,
          subStrand: "Reading",
          contentStandards: "Read simple words in the Ghanaian language",
          indicators: ["Identify vowels in the Ghanaian language", "Read simple CVC words"],
        },
        // ADD MORE ROWS HERE...
      ],
      3: [
        {
          week: 1,
          subStrand: "Writing",
          contentStandards: "Write simple words in the Ghanaian language",
          indicators: ["Copy words written on the board", "Write names of familiar objects"],
        },
        // ADD MORE ROWS HERE...
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BASIC 2
  // ═══════════════════════════════════════════════════════════════════════════
  "Basic 2": {

    "Mathematics": {
      1: [
        {
          week: 1,
          subStrand: "Numbers up to 100",
          contentStandards: "Count, read, and write numbers up to 100",
          indicators: ["Count forwards and backwards from any number up to 100", "Write numbers 1–100 in words and figures"],
        },
        // ADD MORE ROWS HERE...
      ],
      2: [
        {
          week: 1,
          subStrand: "Multiplication",
          contentStandards: "Understand the concept of multiplication as repeated addition",
          indicators: ["Write repeated addition as multiplication", "Recite multiplication tables for 2 and 5"],
        },
        // ADD MORE ROWS HERE...
      ],
      3: [
        {
          week: 1,
          subStrand: "Measurement – Length",
          contentStandards: "Measure lengths using non-standard and standard units",
          indicators: ["Use hand spans and rulers to measure objects", "Compare lengths using longer, shorter, equal"],
        },
        // ADD MORE ROWS HERE...
      ],
    },

    "English Language": {
      1: [
        {
          week: 1,
          subStrand: "Phonics",
          contentStandards: "Apply phonics knowledge to decode words",
          indicators: ["Blend sounds to read words", "Identify digraphs: ch, sh, th"],
        },
        // ADD MORE ROWS HERE...
      ],
      2: [
        { week: 1, subStrand: "Grammar – Nouns", contentStandards: "Identify and use nouns in sentences", indicators: ["Define a noun", "Identify common and proper nouns in sentences"] },
        // ADD MORE ROWS HERE...
      ],
      3: [
        { week: 1, subStrand: "Composition Writing", contentStandards: "Write a simple paragraph on a familiar topic", indicators: ["Write 3–5 sentences on a topic", "Use capital letters and full stops correctly"] },
        // ADD MORE ROWS HERE...
      ],
    },

    "Science": {
      1: [
        { week: 1, subStrand: "Matter", contentStandards: "Identify the three states of matter", indicators: ["Name solids, liquids, and gases", "Give examples of each state of matter"] },
        // ADD MORE ROWS HERE...
      ],
      2: [
        { week: 1, subStrand: "Water", contentStandards: "Describe properties and uses of water", indicators: ["State properties of water", "List uses of water at home and school"] },
        // ADD MORE ROWS HERE...
      ],
      3: [
        { week: 1, subStrand: "Weather", contentStandards: "Describe types of weather", indicators: ["Identify sunny, rainy, and cloudy weather", "Keep a simple weather chart for one week"] },
        // ADD MORE ROWS HERE...
      ],
    },

    "Our World Our People (OWOP)": {
      1: [
        { week: 1, subStrand: "Ghana – Our Country", contentStandards: "Identify Ghana on a map of Africa", indicators: ["Point to Ghana on a map", "Name Ghana's capital city"] },
        // ADD MORE ROWS HERE...
      ],
      2: [
        { week: 1, subStrand: "Natural Features", contentStandards: "Describe natural features in Ghana", indicators: ["Name rivers, lakes, and forests in Ghana", "State uses of rivers and forests"] },
        // ADD MORE ROWS HERE...
      ],
      3: [
        { week: 1, subStrand: "National Symbols", contentStandards: "Identify Ghana's national symbols", indicators: ["Name and describe the flag, coat of arms, and anthem", "State what each symbol represents"] },
        // ADD MORE ROWS HERE...
      ],
    },

    "Religious and Moral Education (RME)": {
      1: [
        { week: 1, subStrand: "Prayer", contentStandards: "Explain the importance of prayer in the three major religions", indicators: ["State why people pray", "Demonstrate a simple prayer"] },
        // ADD MORE ROWS HERE...
      ],
      2: [
        { week: 1, subStrand: "Honesty", contentStandards: "Demonstrate honesty in daily activities", indicators: ["Define honesty", "Give examples of honest behaviour"] },
        // ADD MORE ROWS HERE...
      ],
      3: [
        { week: 1, subStrand: "Respect for Elders", contentStandards: "Show respect to elders and authority figures", indicators: ["Explain why elders deserve respect", "Role-play ways of showing respect"] },
        // ADD MORE ROWS HERE...
      ],
    },

    "Creative Arts": {
      1: [
        { week: 1, subStrand: "Painting", contentStandards: "Apply colour to drawings using paint", indicators: ["Mix primary colours to make secondary colours", "Paint a simple scene"] },
        // ADD MORE ROWS HERE...
      ],
      2: [
        { week: 1, subStrand: "Dance", contentStandards: "Perform simple Ghanaian dances", indicators: ["Identify at least one Ghanaian dance form", "Demonstrate basic steps of the dance"] },
        // ADD MORE ROWS HERE...
      ],
      3: [
        { week: 1, subStrand: "Drama", contentStandards: "Act out simple stories", indicators: ["Act out a familiar story", "Use voice and gesture to express emotion"] },
        // ADD MORE ROWS HERE...
      ],
    },

    "Ghanaian Language": {
      1: [
        { week: 1, subStrand: "Vocabulary", contentStandards: "Expand vocabulary in the Ghanaian language", indicators: ["Learn 10 new words per week", "Use new words in sentences"] },
        // ADD MORE ROWS HERE...
      ],
      2: [
        { week: 1, subStrand: "Story Telling", contentStandards: "Listen to and retell simple stories", indicators: ["Retell a story in own words", "Identify the characters and setting of a story"] },
        // ADD MORE ROWS HERE...
      ],
      3: [
        { week: 1, subStrand: "Writing Sentences", contentStandards: "Write simple sentences in the Ghanaian language", indicators: ["Write 3 sentences about themselves", "Use correct sentence structure"] },
        // ADD MORE ROWS HERE...
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BASIC 3 — Fill in following the same structure above
  // ═══════════════════════════════════════════════════════════════════════════
  "Basic 3": {
    "Mathematics": {
      1: [
        { week: 1, subStrand: "Place Value", contentStandards: "Understand place value up to hundreds", indicators: ["Identify ones, tens, and hundreds", "Write numbers in expanded form"] },
        // ADD MORE ROWS HERE...
      ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "English Language": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Science": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Our World Our People (OWOP)": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Religious and Moral Education (RME)": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Creative Arts": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Ghanaian Language": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BASIC 4
  // ═══════════════════════════════════════════════════════════════════════════
  "Basic 4": {
    "Mathematics": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "English Language": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Science": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Social Studies": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Religious and Moral Education (RME)": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Creative Arts": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Ghanaian Language": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BASIC 5
  // ═══════════════════════════════════════════════════════════════════════════
  "Basic 5": {
    "Mathematics": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "English Language": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Science": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Social Studies": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Religious and Moral Education (RME)": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Creative Arts": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Ghanaian Language": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BASIC 6
  // ═══════════════════════════════════════════════════════════════════════════
  "Basic 6": {
    "Mathematics": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "English Language": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Science": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Social Studies": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Religious and Moral Education (RME)": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Creative Arts": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Ghanaian Language": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BASIC 7
  // ═══════════════════════════════════════════════════════════════════════════
  "Basic 7": {
    "Mathematics": {
      1: [
        { week: 1, subStrand: "Number – Integers", contentStandards: "Perform operations on integers", indicators: ["Add and subtract positive and negative integers", "Multiply and divide integers"] },
        { week: 2, subStrand: "Fractions", contentStandards: "Perform operations on fractions", indicators: ["Add and subtract fractions with unlike denominators", "Multiply and divide simple fractions"] },
        // ADD MORE ROWS HERE...
      ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "English Language": {
      1: [
        { week: 1, subStrand: "Comprehension", contentStandards: "Read and comprehend texts at grade level", indicators: ["Identify the main idea and supporting details", "Answer inferential questions on a passage"] },
        // ADD MORE ROWS HERE...
      ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Integrated Science": {
      1: [
        { week: 1, subStrand: "Scientific Investigation", contentStandards: "Apply the scientific method to investigate problems", indicators: ["State the steps of the scientific method", "Design a simple experiment using the scientific method"] },
        // ADD MORE ROWS HERE...
      ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Social Studies": {
      1: [
        { week: 1, subStrand: "Location of Ghana", contentStandards: "Describe the location of Ghana in Africa and the world", indicators: ["Locate Ghana on a map of Africa", "State Ghana's absolute and relative location"] },
        // ADD MORE ROWS HERE...
      ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Religious and Moral Education (RME)": {
      1: [
        {
          week: 1,
          subStrand: "God, His Nature and Attributes",
          contentStandards: "Explain the nature of God through His attributes in the three major religions",
          indicators: [
            "Identify the attributes of God. E.g. omnipotent, omnipresent, omniscient, love, patience",
            "Discuss how each attribute of God is relevant to daily life",
            "Compare how Christianity, Islam, and African Traditional Religion describe God's attributes",
          ],
        },
        {
          week: 2,
          subStrand: "Worship and Prayers",
          contentStandards: "Describe forms of worship in the three major religions",
          indicators: [
            "State forms of worship in Christianity, Islam, and African Traditional Religion",
            "Explain the significance of worship in each religion",
          ],
        },
        // ADD MORE ROWS HERE...
      ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Creative Arts": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Ghanaian Language": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "French": {
      1: [
        { week: 1, subStrand: "Greetings and Introductions", contentStandards: "Greet and introduce oneself in French", indicators: ["Use 'Bonjour', 'Bonsoir', 'Comment t'appelles-tu?'", "Respond to greetings appropriately"] },
        // ADD MORE ROWS HERE...
      ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BASIC 8
  // ═══════════════════════════════════════════════════════════════════════════
  "Basic 8": {
    "Mathematics": {
      1: [
        { week: 1, subStrand: "Algebraic Expressions", contentStandards: "Simplify algebraic expressions", indicators: ["Collect like terms", "Expand and simplify expressions with brackets"] },
        // ADD MORE ROWS HERE...
      ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "English Language": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Integrated Science": {
      1: [
        { week: 1, subStrand: "Cells", contentStandards: "Describe the structure and function of cells", indicators: ["Label the parts of a plant and animal cell", "State the functions of the nucleus, cell membrane, and cytoplasm"] },
        // ADD MORE ROWS HERE...
      ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Social Studies": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Religious and Moral Education (RME)": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Creative Arts": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Ghanaian Language": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "French": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BASIC 9
  // ═══════════════════════════════════════════════════════════════════════════
  "Basic 9": {
    "Mathematics": {
      1: [
        { week: 1, subStrand: "Linear Equations", contentStandards: "Solve linear equations in one variable", indicators: ["Solve equations of the form ax + b = c", "Verify solutions by substitution"] },
        // ADD MORE ROWS HERE...
      ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "English Language": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Integrated Science": {
      1: [
        { week: 1, subStrand: "Reproduction", contentStandards: "Describe sexual and asexual reproduction in organisms", indicators: ["Distinguish between sexual and asexual reproduction", "Give examples of organisms that reproduce sexually and asexually"] },
        // ADD MORE ROWS HERE...
      ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Social Studies": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Religious and Moral Education (RME)": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Creative Arts": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "Ghanaian Language": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
    "French": {
      1: [ /* ADD ROWS */ ],
      2: [ /* ADD ROWS */ ],
      3: [ /* ADD ROWS */ ],
    },
  },
};

export default curriculumData;