// Image-based flower preset system

export type FlowerCategory = "roses" | "lilys" | "tulips" | "orchids" | "peonies" | "filling" | "greens";

export type FlowerVariety = {
  id: string;           // unique id like "roses-red"
  name: string;         // display name like "Red Rose"
  category: FlowerCategory;
  folder: string;       // subfolder in public/flowers/ e.g. "roses"
  filePrefix: string;   // file prefix e.g. "red" → red-1.webp, red-2.webp, red-3.webp
  variants: number;     // always 3
  // Return image path for a variant
  imagePath: (variant: number) => string;
  thumbPath: (variant: number) => string;
};

// Helper to create a variety
function variety(
  category: FlowerCategory,
  folder: string,
  filePrefix: string,
  name: string,
  filePrefixOverrides?: Record<number, string>,
): FlowerVariety {
  const id = `${folder}-${filePrefix}`;
  return {
    id,
    name,
    category,
    folder,
    filePrefix,
    variants: 3,
    imagePath: (v: number) => {
      const prefix = filePrefixOverrides?.[v] ?? filePrefix;
      return `/flowers/${folder}/${prefix}-${v}.webp`;
    },
    thumbPath: (v: number) => {
      const prefix = filePrefixOverrides?.[v] ?? filePrefix;
      return `/flowers/${folder}/${prefix}-${v}-thumb.webp`;
    },
  };
}

// ---- All varieties ----

export const VARIETIES: FlowerVariety[] = [
  // Roses
  variety("roses", "roses", "red", "Red Rose"),
  variety("roses", "roses", "pink", "Pink Rose"),
  variety("roses", "roses", "white", "White Rose"),
  variety("roses", "roses", "blue", "Blue Rose"),
  variety("roses", "roses", "purple", "Purple Rose"),

  // Lilys
  variety("lilys", "lilys", "stargazer", "Stargazer Lily"),
  variety("lilys", "lilys", "casablanca", "Casablanca Lily"),
  variety("lilys", "lilys", "pink", "Pink Lily"),
  variety("lilys", "lilys", "orange", "Orange Lily"),
  variety("lilys", "lilys", "red", "Red Lily"),
  variety("lilys", "lilys", "blue", "Blue Lily"),
  variety("lilys", "lilys", "yellow", "Yellow Lily"),
  variety("lilys", "lilys", "lila", "Lila Lily"),
  variety("lilys", "lilys", "pinkcalla", "Pink Calla"),
  variety("lilys", "lilys", "whitecalla", "White Calla"),
  variety("lilys", "lilys", "yellowcalla", "Yellow Calla"),
  variety("lilys", "lilys", "roselilypink", "Rose Lily Pink", { 1: "roselillypink" }),
  variety("lilys", "lilys", "roselilywhite", "Rose Lily White"),

  // Tulips
  variety("tulips", "tulips", "red", "Red Tulip"),
  variety("tulips", "tulips", "pink", "Pink Tulip"),
  variety("tulips", "tulips", "yellow", "Yellow Tulip"),
  variety("tulips", "tulips", "orange", "Orange Tulip"),
  variety("tulips", "tulips", "purple", "Purple Tulip"),
  variety("tulips", "tulips", "white", "White Tulip"),
  variety("tulips", "tulips", "blue", "Blue Tulip"),

  // Orchids
  variety("orchids", "orchids", "pink", "Pink Orchid"),
  variety("orchids", "orchids", "purple", "Purple Orchid"),
  variety("orchids", "orchids", "moth", "Moth Orchid"),
  variety("orchids", "orchids", "orange", "Orange Orchid"),
  variety("orchids", "orchids", "yellow", "Yellow Orchid"),
  variety("orchids", "orchids", "teal", "Teal Orchid"),
  variety("orchids", "orchids", "dark", "Dark Orchid"),

  // Peonies
  variety("peonies", "peonies", "pink", "Pink Peony"),
  variety("peonies", "peonies", "red", "Red Peony"),
  variety("peonies", "peonies", "white", "White Peony"),

  // Filling
  variety("filling", "filling", "cherry", "Cherry Blossom"),
  variety("filling", "filling", "carnation", "Carnation"),
  variety("filling", "filling", "bluehortensia", "Blue Hortensia"),
  variety("filling", "filling", "pinkhortensia", "Pink Hortensia"),
  variety("filling", "filling", "whitehortensia", "White Hortensia"),
  variety("filling", "filling", "snapdragonpink", "Pink Snapdragon"),
  variety("filling", "filling", "snapdragonblue", "Blue Snapdragon"),

  // Greens
  variety("greens", "greens", "leaves", "Leaves"),
  variety("greens", "greens", "ballograss", "Ballo Grass"),
  variety("greens", "greens", "snapdragon", "Green Snapdragon"),
];

export const varietyById = (id: string) => VARIETIES.find((v) => v.id === id) ?? VARIETIES[0];

// Group by category for the library panel
export const CATEGORIES: { id: FlowerCategory; label: string }[] = [
  { id: "roses", label: "Roses" },
  { id: "lilys", label: "Lilys" },
  { id: "tulips", label: "Tulips" },
  { id: "orchids", label: "Orchids" },
  { id: "peonies", label: "Peonies" },
  { id: "filling", label: "Filling" },
  { id: "greens", label: "Greens" },
];

export const varietiesByCategory = (cat: FlowerCategory) => VARIETIES.filter((v) => v.category === cat);

export const VASES = [
  { id: "round", name: "Round" },
  { id: "tall", name: "Tall" },
  { id: "jar", name: "Jar" },
  { id: "paper", name: "Paper" },
  { id: "paper-tall", name: "Kraft" },
  { id: "top", name: "Top" },
];

export const BACKGROUNDS: Record<string, string> = {
  midnight: "#09090b",
  zinc:     "#18181b",
  slate:    "#0f172a",
  neutral:  "#171717",
  stone:    "#1c1917",
  rose:     "#1a0a10",
};
