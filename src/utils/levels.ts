export interface Level {
  id: number;
  name: string;
  size: number;
  image?: string | null;
  type: 'number' | 'alphabet' | 'image';
  description: string;
}

const IMAGES = {
  Spiritual: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Shiva_Bangalore.jpg/800px-Shiva_Bangalore.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Ganesha_Basohli_miniature_circa_1730_Dubost_p73.jpg/800px-Ganesha_Basohli_miniature_circa_1730_Dubost_p73.jpg",
    "https://images.unsplash.com/photo-1570215778419-75b4865730d5?q=80&w=1000&ar=1:1&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=1000&ar=1:1&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&ar=1:1&auto=format&fit=crop",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Krishna_fluting_for_the_gopis.jpg/800px-Krishna_fluting_for_the_gopis.jpg",
    "https://images.unsplash.com/photo-1528360983277-13d9b152c6d1?q=80&w=1000&ar=1:1&auto=format&fit=crop",
  ],
  Nature: [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&ar=1:1&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1448375240586-dfd8f3793371?q=80&w=1000&ar=1:1&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&ar=1:1&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1000&ar=1:1&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1000&ar=1:1&auto=format&fit=crop",
  ],
  Architecture: [
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000&ar=1:1&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1000&ar=1:1&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=1000&ar=1:1&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1000&ar=1:1&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&ar=1:1&auto=format&fit=crop",
  ],
  Animals: [
    "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?q=80&w=1000&ar=1:1&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=1000&ar=1:1&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=80&w=1000&ar=1:1&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1444464666168-49d633b86797?q=80&w=1000&ar=1:1&auto=format&fit=crop",
  ],
  Abstract: [
    "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)",
    "linear-gradient(to bottom right, #f472b6, #db2777, #7c3aed)",
    "linear-gradient(to right, #22d3ee, #e879f9, #f43f5e)",
    "radial-gradient(circle at center, #f0abfc, #c084fc, #6366f1)",
  ]
};

export const LEVELS: Level[] = [
  // Tutorial Levels (1-5)
  { id: 1, name: "Initiation", size: 3, type: 'number', image: null, description: "Learn the basics with numbers." },
  { id: 2, name: "Alpha Protocol", size: 3, type: 'alphabet', image: null, description: "Sequence the alphabet." },
  { id: 3, name: "First Light", size: 3, type: 'image', image: IMAGES.Nature[0], description: "Assemble the mountain view." },
  { id: 4, name: "Neon Flow", size: 3, type: 'image', image: IMAGES.Abstract[0], description: "Simple gradient pattern." },
  { id: 5, name: "Urban Start", size: 3, type: 'image', image: IMAGES.Architecture[0], description: "Rebuild the city skyline." },

  // Easy Levels (6-15) - Mostly 3x3, introducing themes
  { id: 6, name: "Forest Path", size: 3, type: 'image', image: IMAGES.Nature[1], description: "Navigate the green." },
  { id: 7, name: "Divine Form", size: 3, type: 'image', image: IMAGES.Spiritual[0], description: "Reveal the deity." },
  { id: 8, name: "Wild King", size: 3, type: 'image', image: IMAGES.Animals[0], description: "The king of beasts." },
  { id: 9, name: "Bridge Crossing", size: 3, type: 'image', image: IMAGES.Architecture[1], description: "Connect the path." },
  { id: 10, name: "Ocean Depths", size: 3, type: 'image', image: IMAGES.Nature[2], description: "Blue waters await." },
  { id: 11, name: "Sacred Space", size: 3, type: 'image', image: IMAGES.Spiritual[1], description: "Ganesha's wisdom." },
  { id: 12, name: "Desert Sands", size: 3, type: 'image', image: IMAGES.Nature[3], description: "Heat and dunes." },
  { id: 13, name: "Tiger Stripe", size: 3, type: 'image', image: IMAGES.Animals[1], description: "Stripes in the wild." },
  { id: 14, name: "Modern Lines", size: 3, type: 'image', image: IMAGES.Architecture[2], description: "Glass and steel." },
  { id: 15, name: "Synthwave", size: 3, type: 'image', image: IMAGES.Abstract[1], description: "Retro aesthetics." },

  // Medium Levels (16-30) - 4x4, increasing complexity
  { id: 16, name: "Number Crunch", size: 4, type: 'number', image: null, description: "4x4 Number Grid." },
  { id: 17, name: "Alpha Beta", size: 4, type: 'alphabet', image: null, description: "4x4 Alphabet Grid." },
  { id: 18, name: "Peaceful Mind", size: 4, type: 'image', image: IMAGES.Spiritual[2], description: "Buddha's serenity." },
  { id: 19, name: "Cyber City", size: 4, type: 'image', image: IMAGES.Architecture[3], description: "Neon future." },
  { id: 20, name: "Elephant Walk", size: 4, type: 'image', image: IMAGES.Animals[2], description: "Gentle giant." },
  { id: 21, name: "Temple Run", size: 4, type: 'image', image: IMAGES.Spiritual[3], description: "Ancient structure." },
  { id: 22, name: "High Voltage", size: 4, type: 'image', image: IMAGES.Abstract[2], description: "Electric gradient." },
  { id: 23, name: "Night Street", size: 4, type: 'image', image: IMAGES.Architecture[4], description: "Rainy neon streets." },
  { id: 24, name: "Meditation", size: 4, type: 'image', image: IMAGES.Spiritual[4], description: "Focus within." },
  { id: 25, name: "Avian Flight", size: 4, type: 'image', image: IMAGES.Animals[3], description: "Feathered friend." },
  { id: 26, name: "Nature's Call", size: 4, type: 'image', image: IMAGES.Nature[4], description: "Green landscape." },
  { id: 27, name: "Divine Flute", size: 4, type: 'image', image: IMAGES.Spiritual[5], description: "Krishna's melody." },
  { id: 28, name: "Void Stare", size: 4, type: 'image', image: IMAGES.Abstract[3], description: "Into the void." },
  { id: 29, name: "Om Symbol", size: 4, type: 'image', image: IMAGES.Spiritual[6], description: "Universal sound." },
  { id: 30, name: "Jungle Deep", size: 4, type: 'image', image: IMAGES.Nature[1], description: "Return to the forest." },

  // Hard Levels (31-45) - 5x5, complex patterns
  { id: 31, name: "Matrix Load", size: 5, type: 'number', image: null, description: "5x5 Number Grid." },
  { id: 32, name: "Complex City", size: 5, type: 'image', image: IMAGES.Architecture[0], description: "Detailed skyline." },
  { id: 33, name: "Many Arms", size: 5, type: 'image', image: IMAGES.Spiritual[0], description: "Shiva detailed." },
  { id: 34, name: "Lion's Mane", size: 5, type: 'image', image: IMAGES.Animals[0], description: "Detailed fur." },
  { id: 35, name: "Mountain Peak", size: 5, type: 'image', image: IMAGES.Nature[0], description: "Snowy heights." },
  { id: 36, name: "Ganesha Art", size: 5, type: 'image', image: IMAGES.Spiritual[1], description: "Intricate art." },
  { id: 37, name: "Bridge Span", size: 5, type: 'image', image: IMAGES.Architecture[1], description: "Long span." },
  { id: 38, name: "Deep Blue", size: 5, type: 'image', image: IMAGES.Nature[2], description: "Ocean waves." },
  { id: 39, name: "Tiger Gaze", size: 5, type: 'image', image: IMAGES.Animals[1], description: "Intense stare." },
  { id: 40, name: "Zen Garden", size: 5, type: 'image', image: IMAGES.Spiritual[2], description: "Peaceful complexity." },
  { id: 41, name: "Neon Night", size: 5, type: 'image', image: IMAGES.Architecture[3], description: "Cyberpunk details." },
  { id: 42, name: "Ancient Walls", size: 5, type: 'image', image: IMAGES.Spiritual[3], description: "Temple details." },
  { id: 43, name: "Desert Storm", size: 5, type: 'image', image: IMAGES.Nature[3], description: "Sand patterns." },
  { id: 44, name: "Modern Art", size: 5, type: 'image', image: IMAGES.Architecture[2], description: "Geometric lines." },
  { id: 45, name: "Elephant Skin", size: 5, type: 'image', image: IMAGES.Animals[2], description: "Texture challenge." },

  // Expert Levels (46-50) - 6x6, ultimate challenge
  { id: 46, name: "Master Grid", size: 6, type: 'number', image: null, description: "6x6 Number Grid." },
  { id: 47, name: "Divine Detail", size: 6, type: 'image', image: IMAGES.Spiritual[5], description: "Krishna detailed." },
  { id: 48, name: "Urban Sprawl", size: 6, type: 'image', image: IMAGES.Architecture[4], description: "City lights." },
  { id: 49, name: "Wild Texture", size: 6, type: 'image', image: IMAGES.Animals[3], description: "Feather patterns." },
  { id: 50, name: "Nirvana", size: 6, type: 'image', image: IMAGES.Spiritual[6], description: "Ultimate peace." },
];
