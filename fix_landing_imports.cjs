const fs = require('fs');
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf-8');

// First remove it from types import
code = code.replace("import { Facebook, Instagram, Music, Send, ProductData, Wilaya, Order, StoreSettings } from '../types';", "import { ProductData, Wilaya, Order, StoreSettings } from '../types';");

// Then add it to lucide-react import
code = code.replace("import { ", "import { Facebook, Instagram, Music, Send, ");

fs.writeFileSync('src/components/LandingPage.tsx', code);
