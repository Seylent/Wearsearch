import product1 from "@/assets/stussy puffer.png";
import product2 from "@/assets/cpcompany puffer.png";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";
import product8 from "@/assets/product-8.jpg";
import product9 from "@/assets/product-9.jpg";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  images: string[];
  description: string;
  stores: Store[];
  color: string;
  type: string;
}

export interface Store {
  name: string;
  telegram?: string;
  instagram?: string;
  shipping: string;
}

export const clothing_items: Product[] = [
  {
    id: 1,
    name: "STUSSY PUFFER",
    category: "Outerwear",
    price: "$29.99",
    image: product1,
    images: [product1, product1, product1],
    description: "Essential wardrobe staple crafted from premium cotton. Features a relaxed fit and timeless design that pairs perfectly with any outfit.",
    color: "black",
    type: "Outerwear",
    stores: [
      {
        name: "Wlocker Store",
        telegram: "https://t.me/wlockerstore",
        instagram: "https://instagram.com/urbanstyle",
        shipping: "Ships worldwide"
      },
      {
        name: "Classic Threads",
        telegram: "https://t.me/classicthreads",
        instagram: "https://instagram.com/classicthreads",
        shipping: "US & Europe (3-7 business days)"
      }
    ]
  },
  {
    id: 2,
    name: "C.P. COMPANY",
    category: "Outerwear",
    price: "$89.99",
    image: product2,
    images: [product2, product2, product2],
    description: "Timeless denim jacket with authentic vintage wash. Durable construction with classic button closure and functional chest pockets.",
    color: "Blue",
    type: "Outerwear",
    stores: [
      {
        name: "Denim District",
        telegram: "https://t.me/denimdistrict",
        instagram: "https://instagram.com/denimdistrict",
        shipping: "Global shipping (5-10 business days)"
      },
      {
        name: "Retro Wear Co.",
        instagram: "https://instagram.com/retrowearco",
        shipping: "North America only (4-6 business days)"
      }
    ]
  },
  {
    id: 3,
    name: "Leather Sneakers",
    category: "Footwear",
    price: "$129.99",
    image: product3,
    images: [product3, product3, product3],
    description: "Premium leather sneakers combining comfort and style. Features cushioned insole and durable rubber sole for all-day wear.",
    color: "Black",
    type: "Shoes",
    stores: [
      {
        name: "Sole Society",
        telegram: "https://t.me/solesociety",
        instagram: "https://instagram.com/solesociety",
        shipping: "Worldwide shipping (7-14 business days)"
      },
      {
        name: "Step Up Footwear",
        telegram: "https://t.me/stepupfootwear",
        shipping: "Europe & Asia (5-8 business days)"
      }
    ]
  },
  {
    id: 4,
    name: "Beige Trench Coat",
    category: "Outerwear",
    price: "$199.99",
    image: product4,
    images: [product4, product4, product4],
    description: "Sophisticated trench coat in classic beige. Water-resistant fabric with adjustable belt and elegant drape for a refined silhouette.",
    color: "Beige",
    type: "Outerwear",
    stores: [
      {
        name: "Elegance Boutique",
        telegram: "https://t.me/eleganceboutique",
        instagram: "https://instagram.com/eleganceboutique",
        shipping: "International shipping (10-15 business days)"
      },
      {
        name: "Luxe Layers",
        instagram: "https://instagram.com/luxelayers",
        shipping: "US & Canada (4-7 business days)"
      }
    ]
  },
  {
    id: 5,
    name: "Black Hoodie",
    category: "Tops",
    price: "$59.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Comfortable black hoodie with premium cotton blend. Features kangaroo pocket and adjustable drawstring hood.",
    color: "Black",
    type: "Tops",
    stores: [
      {
        name: "Streetwear Hub",
        telegram: "https://t.me/streetwearhub",
        instagram: "https://instagram.com/streetwearhub",
        shipping: "Worldwide shipping (5-10 business days)"
      }
    ]
  },
  {
    id: 6,
    name: "Gray Wool Scarf",
    category: "Accessories",
    price: "$39.99",
    image: product6,
    images: [product6, product6, product6],
    description: "Elegant wool scarf with fringe details. Soft and warm for cold weather, featuring a timeless design.",
    color: "Gray",
    type: "Accessories",
    stores: [
      {
        name: "Winter Essentials",
        telegram: "https://t.me/winteressentials",
        instagram: "https://instagram.com/winteressentials",
        shipping: "Europe & US (3-6 business days)"
      }
    ]
  },
  {
    id: 7,
    name: "Brown Leather Belt",
    category: "Accessories",
    price: "$49.99",
    image: product7,
    images: [product7, product7, product7],
    description: "Classic brown leather belt with metal buckle. Genuine leather construction with elegant stitching details.",
    color: "Brown",
    type: "Accessories",
    stores: [
      {
        name: "Leather Goods Co.",
        instagram: "https://instagram.com/leathergoodsco",
        shipping: "International (7-12 business days)"
      }
    ]
  },
  {
    id: 8,
    name: "Classic Blue Jeans",
    category: "Bottoms",
    price: "$79.99",
    image: product8,
    images: [product8, product8, product8],
    description: "Timeless blue denim jeans with comfortable fit. Features classic five-pocket design and durable construction.",
    color: "Blue",
    type: "Bottoms",
    stores: [
      {
        name: "Denim Works",
        telegram: "https://t.me/denimworks",
        instagram: "https://instagram.com/denimworks",
        shipping: "Global shipping (5-9 business days)"
      }
    ]
  },
  {
    id: 9,
    name: "White Classic Sneakers",
    category: "Footwear",
    price: "$99.99",
    image: product9,
    images: [product9, product9, product9],
    description: "Clean white sneakers with minimalist design. Comfortable cushioning and premium leather upper.",
    color: "White",
    type: "Shoes",
    stores: [
      {
        name: "Sneaker Studio",
        telegram: "https://t.me/sneakerstudio",
        instagram: "https://instagram.com/sneakerstudio",
        shipping: "Worldwide (6-10 business days)"
      }
    ]
  }
  ,
  {
    id: 10,
    name: "Denim Overshirt",
    category: "Tops",
    price: "$69.99",
    image: product2,
    images: [product2, product2, product2],
    description: "Casual denim overshirt with a relaxed fit and durable stitching.",
    color: "Blue",
    type: "Tops",
    stores: [
      {
        name: "Denim Works",
        telegram: "https://t.me/denimworks",
        instagram: "https://instagram.com/denimworks",
        shipping: "Global shipping (5-9 business days)"
      }
    ]
  },
  {
    id: 11,
    name: "Lightweight Parka",
    category: "Outerwear",
    price: "$119.99",
    image: product4,
    images: [product4, product4, product4],
    description: "Water-resistant parka ideal for transitional weather with an adjustable hood.",
    color: "Beige",
    type: "Outerwear",
    stores: [
      {
        name: "Elegance Boutique",
        telegram: "https://t.me/eleganceboutique",
        instagram: "https://instagram.com/eleganceboutique",
        shipping: "International shipping (10-15 business days)"
      }
    ]
  },
  {
    id: 12,
    name: "Graphic Tee",
    category: "Tops",
    price: "$24.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Soft cotton tee with a bold graphic print for everyday wear.",
    color: "Black",
    type: "Tops",
    stores: [
      {
        name: "Streetwear Hub",
        telegram: "https://t.me/streetwearhub",
        instagram: "https://instagram.com/streetwearhub",
        shipping: "Worldwide shipping (5-10 business days)"
      }
    ]
  },
  {
    id: 13,
    name: "Corduroy Pants",
    category: "Bottoms",
    price: "$64.99",
    image: product8,
    images: [product8, product8, product8],
    description: "Comfortable corduroy pants with a tapered leg and classic look.",
    color: "Brown",
    type: "Bottoms",
    stores: [
      {
        name: "Denim Works",
        telegram: "https://t.me/denimworks",
        instagram: "https://instagram.com/denimworks",
        shipping: "Global shipping (5-9 business days)"
      }
    ]
  },
  {
    id: 14,
    name: "Suede Boots",
    category: "Footwear",
    price: "$149.99",
    image: product3,
    images: [product3, product3, product3],
    description: "Premium suede boots with a cushioned insole and durable outsole.",
    color: "Brown",
    type: "Shoes",
    stores: [
      {
        name: "Sole Society",
        telegram: "https://t.me/solesociety",
        instagram: "https://instagram.com/solesociety",
        shipping: "Worldwide shipping (7-14 business days)"
      }
    ]
  },
  {
    id: 15,
    name: "Padded Vest",
    category: "Outerwear",
    price: "$79.99",
    image: product1,
    images: [product1, product1, product1],
    description: "Padded vest for layering with insulating fill and a sleek profile.",
    color: "Black",
    type: "Outerwear",
    stores: [
      {
        name: "Wlocker Store",
        telegram: "https://t.me/wlockerstore",
        instagram: "https://instagram.com/urbanstyle",
        shipping: "Ships worldwide"
      }
    ]
  },
  {
    id: 16,
    name: "Wool Beanie",
    category: "Accessories",
    price: "$19.99",
    image: product6,
    images: [product6, product6, product6],
    description: "Warm wool beanie with a soft finish for cold days.",
    color: "Gray",
    type: "Accessories",
    stores: [
      {
        name: "Winter Essentials",
        telegram: "https://t.me/winteressentials",
        instagram: "https://instagram.com/winteressentials",
        shipping: "Europe & US (3-6 business days)"
      }
    ]
  },
  {
    id: 17,
    name: "Leather Wallet",
    category: "Accessories",
    price: "$39.99",
    image: product7,
    images: [product7, product7, product7],
    description: "Slim leather wallet with multiple card slots and premium finish.",
    color: "Brown",
    type: "Accessories",
    stores: [
      {
        name: "Leather Goods Co.",
        instagram: "https://instagram.com/leathergoodsco",
        shipping: "International (7-12 business days)"
      }
    ]
  },
  {
    id: 18,
    name: "Track Jacket",
    category: "Outerwear",
    price: "$54.99",
    image: product2,
    images: [product2, product2, product2],
    description: "Classic track jacket with contrast piping and zip closure.",
    color: "Blue",
    type: "Outerwear",
    stores: [
      {
        name: "Retro Wear Co.",
        instagram: "https://instagram.com/retrowearco",
        shipping: "North America only (4-6 business days)"
      }
    ]
  },
  {
    id: 19,
    name: "Striped Polo",
    category: "Tops",
    price: "$34.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Classic striped polo shirt with breathable cotton fabric.",
    color: "White",
    type: "Tops",
    stores: [
      {
        name: "Streetwear Hub",
        instagram: "https://instagram.com/streetwearhub",
        shipping: "Worldwide shipping (5-10 business days)"
      }
    ]
  },
  {
    id: 20,
    name: "Chino Shorts",
    category: "Bottoms",
    price: "$44.99",
    image: product8,
    images: [product8, product8, product8],
    description: "Lightweight chino shorts with comfortable fit for warm days.",
    color: "Beige",
    type: "Bottoms",
    stores: [
      {
        name: "Denim Works",
        instagram: "https://instagram.com/denimworks",
        shipping: "Global shipping (5-9 business days)"
      }
    ]
  },
  {
    id: 21,
    name: "Canvas Tote",
    category: "Accessories",
    price: "$22.99",
    image: product7,
    images: [product7, product7, product7],
    description: "Durable canvas tote bag perfect for everyday carry.",
    color: "Brown",
    type: "Accessories",
    stores: [
      {
        name: "Leather Goods Co.",
        instagram: "https://instagram.com/leathergoodsco",
        shipping: "International (7-12 business days)"
      }
    ]
  },
  {
    id: 22,
    name: "Running Shorts",
    category: "Bottoms",
    price: "$29.99",
    image: product3,
    images: [product3, product3, product3],
    description: "Lightweight running shorts with moisture-wicking fabric.",
    color: "Black",
    type: "Bottoms",
    stores: [
      {
        name: "Sole Society",
        telegram: "https://t.me/solesociety",
        shipping: "Worldwide shipping (7-14 business days)"
      }
    ]
  },
  {
    id: 23,
    name: "Hooded Sweatshirt",
    category: "Tops",
    price: "$54.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Cozy hooded sweatshirt with soft brushed interior.",
    color: "Gray",
    type: "Tops",
    stores: [
      {
        name: "Streetwear Hub",
        telegram: "https://t.me/streetwearhub",
        shipping: "Worldwide shipping (5-10 business days)"
      }
    ]
  },
  {
    id: 24,
    name: "Slip-On Sneakers",
    category: "Footwear",
    price: "$69.99",
    image: product9,
    images: [product9, product9, product9],
    description: "Easy slip-on sneakers with cushioned sole for casual wear.",
    color: "White",
    type: "Shoes",
    stores: [
      {
        name: "Sneaker Studio",
        telegram: "https://t.me/sneakerstudio",
        shipping: "Worldwide (6-10 business days)"
      }
    ]
  },
  {
    id: 25,
    name: "Fleece Jacket",
    category: "Outerwear",
    price: "$89.99",
    image: product1,
    images: [product1, product1, product1],
    description: "Warm fleece jacket with zip front and snug fit.",
    color: "Black",
    type: "Outerwear",
    stores: [
      {
        name: "Wlocker Store",
        telegram: "https://t.me/wlockerstore",
        instagram: "https://instagram.com/urbanstyle",
        shipping: "Ships worldwide"
      }
    ]
  },
  {
    id: 26,
    name: "Utility Cargo Pants",
    category: "Bottoms",
    price: "$89.99",
    image: product8,
    images: [product8, product8, product8],
    description: "Functional cargo pants with multiple pockets and durable fabric.",
    color: "Green",
    type: "Bottoms",
    stores: [
      {
        name: "Denim Works",
        instagram: "https://instagram.com/denimworks",
        shipping: "Global shipping (5-9 business days)"
      }
    ]
  },
  {
    id: 27,
    name: "Bucket Hat",
    category: "Accessories",
    price: "$24.99",
    image: product6,
    images: [product6, product6, product6],
    description: "Casual bucket hat with soft brim for sun protection.",
    color: "Beige",
    type: "Accessories",
    stores: [
      {
        name: "Winter Essentials",
        instagram: "https://instagram.com/winteressentials",
        shipping: "Europe & US (3-6 business days)"
      }
    ]
  },
  {
    id: 28,
    name: "Performance Tee",
    category: "Tops",
    price: "$29.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Breathable performance tee for workouts and active days.",
    color: "Black",
    type: "Tops",
    stores: [
      {
        name: "Streetwear Hub",
        instagram: "https://instagram.com/streetwearhub",
        shipping: "Worldwide shipping (5-10 business days)"
      }
    ]
  },
  {
    id: 29,
    name: "Leather Loafers",
    category: "Footwear",
    price: "$129.99",
    image: product3,
    images: [product3, product3, product3],
    description: "Classic leather loafers with cushioned insole and polished finish.",
    color: "Brown",
    type: "Shoes",
    stores: [
      {
        name: "Sole Society",
        telegram: "https://t.me/solesociety",
        shipping: "Worldwide shipping (7-14 business days)"
      }
    ]
  },
  {
    id: 30,
    name: "Tech Windbreaker",
    category: "Outerwear",
    price: "$99.99",
    image: product4,
    images: [product4, product4, product4],
    description: "Lightweight windbreaker with water-resistant finish and zip pockets.",
    color: "Blue",
    type: "Outerwear",
    stores: [
      {
        name: "Elegance Boutique",
        instagram: "https://instagram.com/eleganceboutique",
        shipping: "International shipping (10-15 business days)"
      }
    ]
  },
  {
    id: 31,
    name: "Summer Linen Shirt",
    category: "Tops",
    price: "$39.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Lightweight linen shirt perfect for warm weather.",
    color: "White",
    type: "Tops",
    stores: [
      { name: "Streetwear Hub", instagram: "https://instagram.com/streetwearhub", shipping: "Worldwide shipping (5-10 business days)" }
    ]
  },
  {
    id: 32,
    name: "Stretch Chinos",
    category: "Bottoms",
    price: "$49.99",
    image: product8,
    images: [product8, product8, product8],
    description: "Comfortable stretch chinos for everyday wear.",
    color: "Beige",
    type: "Bottoms",
    stores: [
      { name: "Denim Works", instagram: "https://instagram.com/denimworks", shipping: "Global shipping (5-9 business days)" }
    ]
  },
  {
    id: 33,
    name: "Classic Snapback",
    category: "Accessories",
    price: "$19.99",
    image: product6,
    images: [product6, product6, product6],
    description: "Structured snapback cap with embroidered logo.",
    color: "Black",
    type: "Accessories",
    stores: [
      { name: "Winter Essentials", instagram: "https://instagram.com/winteressentials", shipping: "Europe & US (3-6 business days)" }
    ]
  },
  {
    id: 34,
    name: "High-Top Trainers",
    category: "Footwear",
    price: "$119.99",
    image: product3,
    images: [product3, product3, product3],
    description: "Durable high-top trainers with padded ankle support.",
    color: "White",
    type: "Shoes",
    stores: [
      { name: "Sole Society", telegram: "https://t.me/solesociety", shipping: "Worldwide shipping (7-14 business days)" }
    ]
  },
  {
    id: 35,
    name: "Striped Crewneck",
    category: "Tops",
    price: "$34.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Classic striped crewneck sweater for layering.",
    color: "Blue",
    type: "Tops",
    stores: [
      { name: "Streetwear Hub", instagram: "https://instagram.com/streetwearhub", shipping: "Worldwide shipping (5-10 business days)" }
    ]
  },
  {
    id: 36,
    name: "Slim Denim",
    category: "Bottoms",
    price: "$59.99",
    image: product8,
    images: [product8, product8, product8],
    description: "Slim-fit denim with a modern taper.",
    color: "Blue",
    type: "Bottoms",
    stores: [
      { name: "Denim Works", telegram: "https://t.me/denimworks", shipping: "Global shipping (5-9 business days)" }
    ]
  },
  {
    id: 37,
    name: "Woven Belt",
    category: "Accessories",
    price: "$29.99",
    image: product7,
    images: [product7, product7, product7],
    description: "Flexible woven belt with brushed metal buckle.",
    color: "Brown",
    type: "Accessories",
    stores: [
      { name: "Leather Goods Co.", instagram: "https://instagram.com/leathergoodsco", shipping: "International (7-12 business days)" }
    ]
  },
  {
    id: 38,
    name: "Trail Runners",
    category: "Footwear",
    price: "$139.99",
    image: product9,
    images: [product9, product9, product9],
    description: "Lightweight trail running shoes with grippy outsole.",
    color: "Gray",
    type: "Shoes",
    stores: [
      { name: "Sneaker Studio", instagram: "https://instagram.com/sneakerstudio", shipping: "Worldwide (6-10 business days)" }
    ]
  },
  {
    id: 39,
    name: "Oxford Shirt",
    category: "Tops",
    price: "$45.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Crisp oxford shirt with button-down collar.",
    color: "White",
    type: "Tops",
    stores: [
      { name: "Streetwear Hub", instagram: "https://instagram.com/streetwearhub", shipping: "Worldwide shipping (5-10 business days)" }
    ]
  },
  {
    id: 40,
    name: "Relaxed Joggers",
    category: "Bottoms",
    price: "$49.99",
    image: product8,
    images: [product8, product8, product8],
    description: "Cozy relaxed joggers with elastic waistband.",
    color: "Black",
    type: "Bottoms",
    stores: [
      { name: "Denim Works", instagram: "https://instagram.com/denimworks", shipping: "Global shipping (5-9 business days)" }
    ]
  },
  {
    id: 41,
    name: "Canvas Sneakers",
    category: "Footwear",
    price: "$49.99",
    image: product9,
    images: [product9, product9, product9],
    description: "Casual canvas sneakers with rubber sole.",
    color: "White",
    type: "Shoes",
    stores: [
      { name: "Sneaker Studio", telegram: "https://t.me/sneakerstudio", shipping: "Worldwide (6-10 business days)" }
    ]
  },
  {
    id: 42,
    name: "Lightweight Hoodie",
    category: "Tops",
    price: "$44.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Breathable hoodie for transitional weather.",
    color: "Gray",
    type: "Tops",
    stores: [
      { name: "Streetwear Hub", instagram: "https://instagram.com/streetwearhub", shipping: "Worldwide shipping (5-10 business days)" }
    ]
  },
  {
    id: 43,
    name: "Pleated Skirt",
    category: "Bottoms",
    price: "$54.99",
    image: product8,
    images: [product8, product8, product8],
    description: "Classic pleated skirt with soft drape.",
    color: "Beige",
    type: "Bottoms",
    stores: [
      { name: "Denim Works", instagram: "https://instagram.com/denimworks", shipping: "Global shipping (5-9 business days)" }
    ]
  },
  {
    id: 44,
    name: "Wool Overcoat",
    category: "Outerwear",
    price: "$249.99",
    image: product4,
    images: [product4, product4, product4],
    description: "Tailored wool overcoat for a refined look.",
    color: "Brown",
    type: "Outerwear",
    stores: [
      { name: "Elegance Boutique", instagram: "https://instagram.com/eleganceboutique", shipping: "International shipping (10-15 business days)" }
    ]
  },
  {
    id: 45,
    name: "Polo Dress",
    category: "Tops",
    price: "$49.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Casual polo dress with soft cotton blend.",
    color: "Blue",
    type: "Tops",
    stores: [
      { name: "Streetwear Hub", instagram: "https://instagram.com/streetwearhub", shipping: "Worldwide shipping (5-10 business days)" }
    ]
  },
  {
    id: 46,
    name: "Field Jacket",
    category: "Outerwear",
    price: "$129.99",
    image: product1,
    images: [product1, product1, product1],
    description: "Durable field jacket with multiple pockets.",
    color: "Green",
    type: "Outerwear",
    stores: [
      { name: "Wlocker Store", telegram: "https://t.me/wlockerstore", shipping: "Ships worldwide" }
    ]
  },
  {
    id: 47,
    name: "Denim Skirt",
    category: "Bottoms",
    price: "$39.99",
    image: product8,
    images: [product8, product8, product8],
    description: "Casual denim skirt with button front.",
    color: "Blue",
    type: "Bottoms",
    stores: [
      { name: "Denim Works", instagram: "https://instagram.com/denimworks", shipping: "Global shipping (5-9 business days)" }
    ]
  },
  {
    id: 48,
    name: "Quilted Jacket",
    category: "Outerwear",
    price: "$149.99",
    image: product2,
    images: [product2, product2, product2],
    description: "Warm quilted jacket with a flattering silhouette.",
    color: "Black",
    type: "Outerwear",
    stores: [
      { name: "Retro Wear Co.", instagram: "https://instagram.com/retrowearco", shipping: "North America only (4-6 business days)" }
    ]
  },
  {
    id: 49,
    name: "Satin Blouse",
    category: "Tops",
    price: "$59.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Elegant satin blouse for dressier occasions.",
    color: "White",
    type: "Tops",
    stores: [
      { name: "Elegance Boutique", instagram: "https://instagram.com/eleganceboutique", shipping: "International shipping (10-15 business days)" }
    ]
  },
  {
    id: 50,
    name: "Mesh Trainers",
    category: "Footwear",
    price: "$119.99",
    image: product3,
    images: [product3, product3, product3],
    description: "Breathable mesh trainers for running and gym use.",
    color: "Gray",
    type: "Shoes",
    stores: [
      { name: "Sole Society", telegram: "https://t.me/solesociety", shipping: "Worldwide shipping (7-14 business days)" }
    ]
  },
  {
    id: 51,
    name: "Cropped Sweater",
    category: "Tops",
    price: "$44.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Cozy cropped sweater with ribbed hem.",
    color: "Brown",
    type: "Tops",
    stores: [
      { name: "Streetwear Hub", instagram: "https://instagram.com/streetwearhub", shipping: "Worldwide shipping (5-10 business days)" }
    ]
  },
  {
    id: 52,
    name: "Utility Jacket",
    category: "Outerwear",
    price: "$139.99",
    image: product1,
    images: [product1, product1, product1],
    description: "Practical utility jacket with durable shell.",
    color: "Beige",
    type: "Outerwear",
    stores: [
      { name: "Wlocker Store", telegram: "https://t.me/wlockerstore", shipping: "Ships worldwide" }
    ]
  },
  {
    id: 53,
    name: "Pleated Trousers",
    category: "Bottoms",
    price: "$69.99",
    image: product8,
    images: [product8, product8, product8],
    description: "Smart pleated trousers for work or events.",
    color: "Black",
    type: "Bottoms",
    stores: [
      { name: "Denim Works", instagram: "https://instagram.com/denimworks", shipping: "Global shipping (5-9 business days)" }
    ]
  },
  {
    id: 54,
    name: "Knitted Beanie",
    category: "Accessories",
    price: "$14.99",
    image: product6,
    images: [product6, product6, product6],
    description: "Soft knitted beanie to keep you warm.",
    color: "Gray",
    type: "Accessories",
    stores: [
      { name: "Winter Essentials", instagram: "https://instagram.com/winteressentials", shipping: "Europe & US (3-6 business days)" }
    ]
  },
  {
    id: 55,
    name: "Chelsea Boots",
    category: "Footwear",
    price: "$159.99",
    image: product3,
    images: [product3, product3, product3],
    description: "Classic Chelsea boots in polished leather.",
    color: "Brown",
    type: "Shoes",
    stores: [
      { name: "Sole Society", telegram: "https://t.me/solesociety", shipping: "Worldwide shipping (7-14 business days)" }
    ]
  },
  {
    id: 56,
    name: "Denim Jacket",
    category: "Outerwear",
    price: "$99.99",
    image: product2,
    images: [product2, product2, product2],
    description: "Classic denim jacket with durable stitching.",
    color: "Blue",
    type: "Outerwear",
    stores: [
      { name: "Denim District", telegram: "https://t.me/denimdistrict", shipping: "Global shipping (5-10 business days)" }
    ]
  },
  {
    id: 57,
    name: "Pleated Dress",
    category: "Tops",
    price: "$79.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Elegant pleated dress with flattering silhouette.",
    color: "Beige",
    type: "Tops",
    stores: [
      { name: "Elegance Boutique", instagram: "https://instagram.com/eleganceboutique", shipping: "International shipping (10-15 business days)" }
    ]
  },
  {
    id: 58,
    name: "Slip Dress",
    category: "Tops",
    price: "$59.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Lightweight slip dress for day or night.",
    color: "White",
    type: "Tops",
    stores: [
      { name: "Streetwear Hub", instagram: "https://instagram.com/streetwearhub", shipping: "Worldwide shipping (5-10 business days)" }
    ]
  },
  {
    id: 59,
    name: "Ribbed Tank",
    category: "Tops",
    price: "$19.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Essential ribbed tank top for layering.",
    color: "Black",
    type: "Tops",
    stores: [
      { name: "Streetwear Hub", instagram: "https://instagram.com/streetwearhub", shipping: "Worldwide shipping (5-10 business days)" }
    ]
  },
  {
    id: 60,
    name: "Cord Jacket",
    category: "Outerwear",
    price: "$119.99",
    image: product1,
    images: [product1, product1, product1],
    description: "Corduroy jacket with warm lining.",
    color: "Brown",
    type: "Outerwear",
    stores: [
      { name: "Wlocker Store", instagram: "https://instagram.com/urbanstyle", shipping: "Ships worldwide" }
    ]
  },
  {
    id: 61,
    name: "Pleated Culottes",
    category: "Bottoms",
    price: "$54.99",
    image: product8,
    images: [product8, product8, product8],
    description: "Loose-fit culottes with tailored pleats.",
    color: "Beige",
    type: "Bottoms",
    stores: [
      { name: "Denim Works", instagram: "https://instagram.com/denimworks", shipping: "Global shipping (5-9 business days)" }
    ]
  },
  {
    id: 62,
    name: "Faux Leather Jacket",
    category: "Outerwear",
    price: "$129.99",
    image: product2,
    images: [product2, product2, product2],
    description: "Stylish faux leather jacket with moto details.",
    color: "Black",
    type: "Outerwear",
    stores: [
      { name: "Retro Wear Co.", instagram: "https://instagram.com/retrowearco", shipping: "North America only (4-6 business days)" }
    ]
  },
  {
    id: 63,
    name: "Sunglasses",
    category: "Accessories",
    price: "$79.99",
    image: product7,
    images: [product7, product7, product7],
    description: "Polarized sunglasses with UV protection.",
    color: "Black",
    type: "Accessories",
    stores: [
      { name: "Leather Goods Co.", instagram: "https://instagram.com/leathergoodsco", shipping: "International (7-12 business days)" }
    ]
  },
  {
    id: 64,
    name: "Performance Shorts",
    category: "Bottoms",
    price: "$34.99",
    image: product8,
    images: [product8, product8, product8],
    description: "Quick-dry performance shorts for workouts.",
    color: "Blue",
    type: "Bottoms",
    stores: [
      { name: "Denim Works", instagram: "https://instagram.com/denimworks", shipping: "Global shipping (5-9 business days)" }
    ]
  },
  {
    id: 65,
    name: "Slip-On Loafers",
    category: "Footwear",
    price: "$99.99",
    image: product3,
    images: [product3, product3, product3],
    description: "Smart slip-on loafers in soft leather.",
    color: "Brown",
    type: "Shoes",
    stores: [
      { name: "Sole Society", instagram: "https://instagram.com/solesociety", shipping: "Worldwide shipping (7-14 business days)" }
    ]
  },
  {
    id: 66,
    name: "Graphic Hoodie",
    category: "Tops",
    price: "$59.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Bold graphic hoodie with soft interior.",
    color: "Black",
    type: "Tops",
    stores: [
      { name: "Streetwear Hub", instagram: "https://instagram.com/streetwearhub", shipping: "Worldwide shipping (5-10 business days)" }
    ]
  },
  {
    id: 67,
    name: "Thermal Leggings",
    category: "Bottoms",
    price: "$34.99",
    image: product8,
    images: [product8, product8, product8],
    description: "Warm thermal leggings for cold days.",
    color: "Gray",
    type: "Bottoms",
    stores: [
      { name: "Denim Works", instagram: "https://instagram.com/denimworks", shipping: "Global shipping (5-9 business days)" }
    ]
  },
  {
    id: 68,
    name: "Racer Sneakers",
    category: "Footwear",
    price: "$109.99",
    image: product9,
    images: [product9, product9, product9],
    description: "Lightweight racer sneakers for everyday comfort.",
    color: "White",
    type: "Shoes",
    stores: [
      { name: "Sneaker Studio", telegram: "https://t.me/sneakerstudio", shipping: "Worldwide (6-10 business days)" }
    ]
  },
  {
    id: 69,
    name: "Wrap Cardigan",
    category: "Tops",
    price: "$69.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Soft wrap cardigan with relaxed fit.",
    color: "Brown",
    type: "Tops",
    stores: [
      { name: "Streetwear Hub", instagram: "https://instagram.com/streetwearhub", shipping: "Worldwide shipping (5-10 business days)" }
    ]
  },
  {
    id: 70,
    name: "Field Shirt",
    category: "Tops",
    price: "$54.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Casual field shirt with chest pockets.",
    color: "Green",
    type: "Tops",
    stores: [
      { name: "Wlocker Store", instagram: "https://instagram.com/urbanstyle", shipping: "Ships worldwide" }
    ]
  },
  {
    id: 71,
    name: "Cuffed Jeans",
    category: "Bottoms",
    price: "$59.99",
    image: product8,
    images: [product8, product8, product8],
    description: "Cuffed jeans with vintage wash.",
    color: "Blue",
    type: "Bottoms",
    stores: [
      { name: "Denim Works", instagram: "https://instagram.com/denimworks", shipping: "Global shipping (5-9 business days)" }
    ]
  },
  {
    id: 72,
    name: "Puffer Coat",
    category: "Outerwear",
    price: "$199.99",
    image: product1,
    images: [product1, product1, product1],
    description: "Insulated puffer coat for cold climates.",
    color: "Black",
    type: "Outerwear",
    stores: [
      { name: "Wlocker Store", telegram: "https://t.me/wlockerstore", shipping: "Ships worldwide" }
    ]
  },
  {
    id: 73,
    name: "Mesh Cap",
    category: "Accessories",
    price: "$16.99",
    image: product6,
    images: [product6, product6, product6],
    description: "Breathable mesh cap for sunny days.",
    color: "White",
    type: "Accessories",
    stores: [
      { name: "Winter Essentials", instagram: "https://instagram.com/winteressentials", shipping: "Europe & US (3-6 business days)" }
    ]
  },
  {
    id: 74,
    name: "Slip Dress Satin",
    category: "Tops",
    price: "$64.99",
    image: product5,
    images: [product5, product5, product5],
    description: "Satin slip dress with delicate straps.",
    color: "Beige",
    type: "Tops",
    stores: [
      { name: "Elegance Boutique", instagram: "https://instagram.com/eleganceboutique", shipping: "International shipping (10-15 business days)" }
    ]
  },
  {
    id: 75,
    name: "All-Weather Parka",
    category: "Outerwear",
    price: "$219.99",
    image: product4,
    images: [product4, product4, product4],
    description: "Technical parka built for harsh conditions.",
    color: "Gray",
    type: "Outerwear",
    stores: [
      { name: "Elegance Boutique", instagram: "https://instagram.com/eleganceboutique", shipping: "International shipping (10-15 business days)" }
    ]
  }
];
