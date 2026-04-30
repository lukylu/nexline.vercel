const { initDatabase, getDb, saveDatabase } = require('./src/models/database');
const fs = require('fs');
const path = require('path');

async function reseed() {
    await initDatabase();
    const db = getDb();

    // Recreate table to ensure schema is correct
    db.run('DROP TABLE IF EXISTS products');
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        old_price REAL,
        category TEXT,
        images TEXT,
        sizes TEXT,
        color TEXT,
        badge TEXT,
        stock INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT 0,
        is_new BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const productsBase = [
        { name: "Billiard Tee", category: "tees", price: 55, old_price: null, description: "100% combed ring-spun cotton. Oversized drop-shoulder cut.", sizes: ["XS", "S", "M", "L", "XL"] },
        { name: "Gods Of Love Tee", category: "tees", price: 55, old_price: null, description: "100% combed ring-spun cotton. Oversized drop-shoulder cut.", sizes: ["XS", "S", "M", "L", "XL"] },
        { name: "Ice Cube Tee", category: "tees", price: 50, old_price: null, description: "100% combed ring-spun cotton. Oversized drop-shoulder cut.", sizes: ["XS", "S", "M", "L", "XL"] },
        { name: "Ice Heart Tee", category: "tees", price: 55, old_price: null, description: "100% combed ring-spun cotton. Oversized drop-shoulder cut.", sizes: ["XS", "S", "M", "L", "XL"] },
        { name: "Red Dice Tee", category: "tees", price: 50, old_price: null, description: "100% combed ring-spun cotton. Oversized drop-shoulder cut.", sizes: ["XS", "S", "M", "L", "XL"] },
        { name: "FG Zipper", category: "hoodies", price: 89, old_price: 120, description: "Heavyweight 400gsm fleece. Drop shoulder cut.", sizes: ["S", "M", "L", "XL", "XXL"] },
        { name: "Gods Brand Hoodie", category: "hoodies", price: 95, old_price: null, description: "Heavyweight 400gsm fleece. Drop shoulder cut.", sizes: ["S", "M", "L", "XL", "XXL"] },
        { name: "Iced Heart Hoodie", category: "hoodies", price: 89, old_price: null, description: "Heavyweight 400gsm fleece. Drop shoulder cut.", sizes: ["S", "M", "L", "XL", "XXL"] },
        { name: "Red Dice Hoodie", category: "hoodies", price: 85, old_price: null, description: "Heavyweight 400gsm fleece. Drop shoulder cut.", sizes: ["S", "M", "L", "XL", "XXL"] },
        { name: "Valentine's Hoodie", category: "hoodies", price: 92, old_price: null, description: "Heavyweight 400gsm fleece. Drop shoulder cut.", sizes: ["S", "M", "L", "XL", "XXL"] },
        { name: "Team Zip-up Hoodie", category: "hoodies", price: 95, old_price: null, description: "Heavyweight 400gsm fleece. Drop shoulder cut.", sizes: ["S", "M", "L", "XL", "XXL"] },
        { name: "Sudadera con Cremallera", category: "hoodies", price: 85, old_price: null, description: "Heavyweight 400gsm fleece. Zip-up closure.", sizes: ["S", "M", "L", "XL", "XXL"] },
        { name: "Leisure Club Tee", category: "tees", price: 55, old_price: null, description: "100% combed ring-spun cotton. Oversized drop-shoulder cut.", sizes: ["XS", "S", "M", "L", "XL"] },
        { name: "Winners Club Tee", category: "tees", price: 55, old_price: null, description: "100% combed ring-spun cotton. Oversized drop-shoulder cut.", sizes: ["XS", "S", "M", "L", "XL"] },
        { name: "Real Down OG Puffer Jacket", category: "jackets", price: 160, old_price: null, description: "Premium insulation. Warm and lightweight.", sizes: ["S", "M", "L", "XL"] },
        { name: "Teddy Degrade Jacket Solid", category: "jackets", price: 140, old_price: null, description: "Premium teddy fleece. Warm and stylish.", sizes: ["S", "M", "L", "XL"] },
        { name: "1960a nb", category: "sneakers", price: 155, old_price: 180, description: "Premium materials. Iconic silhouette.", sizes: ["39", "40", "41", "42", "43", "44", "45"] },
        { name: "740 nb", category: "sneakers", price: 110, old_price: null, description: "Comfort and style for everyday wear.", sizes: ["39", "40", "41", "42", "43", "44", "45"] },
        { name: "Air Jordan 4 Retro", category: "sneakers", price: 180, old_price: 220, description: "Premium materials. Iconic silhouette.", sizes: ["39", "40", "41", "42", "43", "44", "45"] },
        { name: "KD18 x Chet Holmgren", category: "sneakers", price: 130, old_price: 180, description: "Premium materials. Iconic silhouette.", sizes: ["39", "40", "41", "42", "43", "44", "45"] },
        { name: "Nike Air Force 1'07", category: "sneakers", price: 110, old_price: null, description: "Premium materials. Iconic silhouette.", sizes: ["39", "40", "41", "42", "43", "44", "45"] },
        { name: "Nike Air Max Moto 2k", category: "sneakers", price: 145, old_price: null, description: "Premium materials. Iconic silhouette.", sizes: ["39", "40", "41", "42", "43", "44", "45"] },
        { name: "Nike Air Max Plus", category: "sneakers", price: 150, old_price: null, description: "Premium materials. Iconic silhouette.", sizes: ["39", "40", "41", "42", "43", "44", "45"] }
    ];

    const sourceBase = path.join(__dirname, '..', 'nexline_datos', 'images');
    const destBase = path.join(__dirname, 'uploads', 'products');

    function clean(s) {
        return s.toLowerCase().replace(/the north face/g, 'tnf').replace(/[\s\-_]/g, '');
    }

    const colors = ['black', 'red', 'white', 'cream', 'navy', 'grey', 'rose', 'cian', 'azul', 'multicolor', 'light_cream', 'blancas', 'negras', 'marrones', 'rosas', 'moradas', 'azules', 'crema', 'gris'];

    function findProductMatch(folderName, categoryHint) {
        const cFolder = clean(folderName);
        if (colors.includes(cFolder)) return null;

        return productsBase.find(p => {
            if (categoryHint && p.category !== categoryHint) return false;
            const pClean = clean(p.name);
            return cFolder === pClean || (cFolder.length > 4 && (pClean.includes(cFolder) || cFolder.includes(pClean)));
        });
    }

    const insertProduct = db.prepare(`
      INSERT INTO products (name, description, price, old_price, category, images, sizes, color, badge, stock, is_featured, is_new)
      VALUES ($name, $description, $price, $old_price, $category, $images, $sizes, $color, $badge, $stock, $is_featured, $is_new)
    `);

    function copyAndProcess(sourceDir, relativeCollectionPath, isFeatured, isNew) {
        if (!fs.existsSync(sourceDir)) return;

        function walkDir(dir, relPath = '') {
            const files = fs.readdirSync(dir);
            const imageFiles = files.filter(f => f.match(/\.(jpg|jpeg|png|webp|avif)$/i));
            
            if (imageFiles.length > 0) {
                const parts = relPath.split(path.sep);
                const categoryHint = relPath.includes('sudaderas') || relPath.includes('hoodie') ? 'hoodies' :
                                     relPath.includes('camisetas') || relPath.includes('tee') ? 'tees' :
                                     relPath.includes('zapatillas') || relPath.includes('sneakers') ? 'sneakers' :
                                     relPath.includes('cazadoras') || relPath.includes('jacket') ? 'jackets' : null;

                let product = null;
                let colorVal = 'OG';

                for (let i = 0; i < parts.length; i++) {
                    const match = findProductMatch(parts[i], categoryHint);
                    if (match) {
                        product = match;
                        if (i < parts.length - 1) {
                            colorVal = parts[parts.length - 1].replace(/[\s\-_]/g, ' ').toUpperCase();
                        }
                    }
                }

                if (product) {
                    // Create destination folder
                    const destDir = path.join(destBase, relativeCollectionPath, relPath);
                    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

                    const copiedImages = [];
                    imageFiles.forEach(f => {
                        const srcPath = path.join(dir, f);
                        const dstPath = path.join(destDir, f);
                        fs.copyFileSync(srcPath, dstPath);
                        copiedImages.push(`/uploads/products/${relativeCollectionPath}/${relPath.replace(/\\/g, '/')}/${f}`);
                    });

                    insertProduct.run({
                        $name: product.name,
                        $description: product.description,
                        $price: product.price,
                        $old_price: product.old_price,
                        $category: product.category,
                        $images: JSON.stringify(copiedImages),
                        $sizes: JSON.stringify(product.sizes),
                        $color: colorVal,
                        $badge: isNew ? 'NEW' : (isFeatured ? 'HOT' : null),
                        $stock: 100,
                        $is_featured: isFeatured ? 1 : 0,
                        $is_new: isNew ? 1 : 0
                    });
                    console.log(`✅ [${isFeatured?'BS':(isNew?'NEW':'REG')}] ${product.name} - ${colorVal}`);
                }
            }

            files.forEach(f => {
                const fullPath = path.join(dir, f);
                if (fs.statSync(fullPath).isDirectory()) walkDir(fullPath, path.join(relPath, f));
            });
        }
        walkDir(sourceDir);
    }

    console.log('🚀 Iniciando re-sembrado desde nexline_datos...');
    
    // Clear old uploads to avoid duplicates
    if (fs.existsSync(destBase)) fs.rmSync(destBase, { recursive: true, force: true });
    fs.mkdirSync(destBase, { recursive: true });

    console.log('📦 Escaneando Best Sellers...');
    copyAndProcess(path.join(sourceBase, 'best_sellers'), 'best_sellers', true, false);
    
    console.log('📦 Escaneando New Arrival...');
    copyAndProcess(path.join(sourceBase, 'new_arrival'), 'new_arrival', false, true);
    
    console.log('📦 Escaneando Productos Regulares...');
    copyAndProcess(path.join(sourceBase, 'productos'), 'productos', false, false);

    insertProduct.free();
    saveDatabase();
    console.log('✅ Catálogo reconstruido con colecciones.');
    process.exit(0);
}

reseed().catch(err => { console.error(err); process.exit(1); });
