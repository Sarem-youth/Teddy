<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedAdmin();
        $this->seedSettings();
        $this->seedCatalog();
    }

    private function seedAdmin(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@teddytrading.com'],
            [
                'name' => 'Teddy Administrator',
                'phone' => '+251 91 123 4567',
                'password' => 'TeddyAdmin@2026', // hashed cast -> bcrypt. CHANGE AFTER FIRST LOGIN!
                'is_admin' => true,
            ]
        );
    }

    private function seedSettings(): void
    {
        $defaults = [
            'store_name' => 'Teddy General Trading',
            'store_tagline' => 'Ethiopia\'s trusted source for water materials & equipment',
            'store_email' => 'info@teddytrading.com',
            'store_phone' => '+251 91 123 4567',
            'store_phone_alt' => '+251 11 662 0000',
            'store_address' => 'Merkato, Dubai Tera Building, 2nd Floor, Addis Ababa, Ethiopia',
            'currency' => 'ETB',
            'tax_rate' => '15',
            'shipping_fee' => '150',
            'free_shipping_threshold' => '20000',
            'bank_name' => 'Commercial Bank of Ethiopia (CBE)',
            'bank_account_name' => 'Teddy General Trading PLC',
            'bank_account_number' => '1000123456789',
            'telebirr_number' => '+251 91 123 4567',
            'facebook_url' => 'https://facebook.com/teddytrading',
            'telegram_url' => 'https://t.me/teddytrading',
            'whatsapp_number' => '+251911234567',
            'announcement_text' => 'Free delivery within Addis Ababa on orders above ETB 20,000!',
            'about_text' => 'Teddy General Trading has been supplying Ethiopia with premium water pumps, filtration systems, pipes, valves and specialized fittings for over a decade. From household plumbing to large-scale irrigation and borehole projects, we deliver certified equipment backed by expert technical support.',
        ];

        foreach ($defaults as $key => $value) {
            Setting::firstOrCreate(['key' => $key], ['value' => $value]);
        }
    }

    private function seedCatalog(): void
    {
        if (Product::count() > 0) {
            return; // don't duplicate demo data
        }

        $categories = [
            ['name' => 'Water Pumps', 'icon' => 'pump', 'description' => 'Centrifugal, submersible, booster and solar pumps for every project size.', 'image' => '/uploads/products/seed/pump.svg'],
            ['name' => 'Filtration Systems', 'icon' => 'filter', 'description' => 'Household and industrial water purification, RO systems and cartridges.', 'image' => '/uploads/products/seed/filtration.svg'],
            ['name' => 'Pipes & Fittings', 'icon' => 'pipes', 'description' => 'HDPE, PPR, PVC and galvanized pipes with a full range of fittings.', 'image' => '/uploads/products/seed/pipes.svg'],
            ['name' => 'Valves & Controls', 'icon' => 'valve', 'description' => 'Gate, ball, check and float valves plus pressure control systems.', 'image' => '/uploads/products/seed/valve.svg'],
            ['name' => 'Tanks & Storage', 'icon' => 'tank', 'description' => 'Polyethylene and stainless steel reservoirs from 500L to 20,000L.', 'image' => '/uploads/products/seed/tank.svg'],
            ['name' => 'Irrigation Equipment', 'icon' => 'irrigation', 'description' => 'Drip lines, sprinklers and complete smallholder irrigation kits.', 'image' => '/uploads/products/seed/irrigation.svg'],
            ['name' => 'Meters & Accessories', 'icon' => 'meter', 'description' => 'Water meters, pressure gauges, hoses, clamps and jobsite accessories.', 'image' => '/uploads/products/seed/meter.svg'],
        ];

        $categoryModels = [];
        foreach ($categories as $i => $cat) {
            $categoryModels[$cat['name']] = Category::create([
                'name' => $cat['name'],
                'slug' => Str::slug($cat['name']),
                'description' => $cat['description'],
                'icon' => $cat['icon'],
                'image' => $cat['image'],
                'is_active' => true,
                'sort_order' => $i,
            ]);
        }

        $products = [
            // ---- Water Pumps ----
            ['category' => 'Water Pumps', 'title' => 'Pedrollo CPm 620 Centrifugal Pump 1HP', 'price' => 14500, 'compare' => 16200, 'stock' => 24, 'featured' => true, 'image' => 'pump.svg', 'sku' => 'WP-CPM620',
                'short' => 'Reliable Italian-made 1HP centrifugal pump ideal for domestic water supply and small farms.',
                'details' => "Power: 1 HP (0.75 kW), single phase 220-240V / 50Hz\nMax flow rate: 100 L/min\nMax head: 40 m\nSuction/Delivery: 1\" x 1\"\nBody: Cast iron with brass impeller\nInsulation class F, IP44 protection\nIdeal for: domestic supply, garden irrigation, pressure boosting\nWarranty: 12 months official Pedrollo warranty"],
            ['category' => 'Water Pumps', 'title' => 'Grundfos SQ 3-65 Submersible Borehole Pump', 'price' => 68500, 'compare' => null, 'stock' => 8, 'featured' => true, 'image' => 'pump.svg', 'sku' => 'WP-SQ365',
                'short' => '3" high-efficiency submersible pump for boreholes up to 100m with built-in protection.',
                'details' => "Rated flow: 3 m³/h\nMax head: 65 m\nMotor: 1.15 kW permanent magnet, 200-240V\nDiameter: 74 mm (fits 3\" boreholes)\nBuilt-in: dry-running protection, over/under-voltage protection, soft start\nMaterials: Stainless steel EN 1.4301\nApplication: deep wells, boreholes, groundwater supply\nWarranty: 24 months"],
            ['category' => 'Water Pumps', 'title' => 'Solar Submersible Pump Kit 500W with Controller', 'price' => 89900, 'compare' => 105000, 'stock' => 5, 'featured' => true, 'image' => 'pump.svg', 'sku' => 'WP-SOL500',
                'short' => 'Complete off-grid solar pumping solution — pump, MPPT controller and cabling included.',
                'details' => "Pump: 500W DC brushless submersible, stainless body\nMax head: 50 m | Max flow: 2.5 m³/h\nController: MPPT with dry-run, overload and low-voltage protection\nSolar input: 2 x 300W panels (not included) — VOC 90V max\nCable: 20 m submersible cable included\nPerfect for: remote farms, cattle troughs, rural water schemes\nWarranty: 18 months on pump and controller"],
            ['category' => 'Water Pumps', 'title' => 'Booster Pump PW-139EA Automatic 0.5HP', 'price' => 9800, 'compare' => 11500, 'stock' => 32, 'featured' => false, 'image' => 'pump.svg', 'sku' => 'WP-PW139',
                'short' => 'Compact automatic booster pump for apartments and showers with pressure switch.',
                'details' => "Power: 0.37 kW (0.5 HP), 220V/50Hz\nMax flow: 35 L/min | Max head: 35 m\nAutomatic on/off via built-in flow switch\nConnections: 1\" BSP\nNoise level: < 55 dB\nApplication: apartment pressure boosting, water heaters, showers"],

            // ---- Filtration ----
            ['category' => 'Filtration Systems', 'title' => '6-Stage Reverse Osmosis System 75GPD', 'price' => 18500, 'compare' => 21000, 'stock' => 15, 'featured' => true, 'image' => 'filtration.svg', 'sku' => 'FS-RO75',
                'short' => 'Under-sink RO purifier with mineralizer producing bottled-quality drinking water.',
                'details' => "Capacity: 75 gallons per day (285 L/day)\nStages: PP sediment → GAC carbon → CTO carbon → RO membrane → post-carbon → mineralizer\nStorage tank: 3.2 gallon pressurized steel tank\nRemoves: 96%+ of dissolved solids, chlorine, heavy metals, bacteria\nIncludes: faucet, tubing, wrench and spare filter set\nFits standard kitchen cabinets\nFilter life: 6-12 months (stages 1-3)"],
            ['category' => 'Filtration Systems', 'title' => 'Industrial Sand Filter FRP 1054 with Runxin Valve', 'price' => 32500, 'compare' => null, 'stock' => 9, 'featured' => false, 'image' => 'filtration.svg', 'sku' => 'FS-FRP1054',
                'short' => 'Fiberglass multimedia filter vessel for sediment and turbidity removal up to 1.8 m³/h.',
                'details' => "Vessel: FRP 1054 (10\" x 54\"), 150 psi rated\nValve: Runxin manual multiport valve 1\"\nMedia: graded silica sand + gravel bed (included)\nService flow: 1.8 m³/h\nApplication: pre-filtration for RO, borehole water clarification, commercial buildings\nBackwash: manual, 10-15 minutes weekly"],
            ['category' => 'Filtration Systems', 'title' => 'Big Blue 20" Jumbo Filter Housing + PP Cartridge', 'price' => 4650, 'compare' => 5200, 'stock' => 46, 'featured' => false, 'image' => 'filtration.svg', 'sku' => 'FS-BB20',
                'short' => 'Heavy-duty whole-house sediment filtration with 5-micron polypropylene cartridge.',
                'details' => "Housing: Big Blue 20\", 1\" brass-insert ports, pressure release button\nCartridge: 20\" x 4.5\" PP spun, 5 micron (included)\nMax pressure: 6 bar | Max temp: 40°C\nIncludes wall bracket and housing wrench\nRecommended cartridge change: every 3-6 months"],

            // ---- Pipes & Fittings ----
            ['category' => 'Pipes & Fittings', 'title' => 'HDPE Pipe 32mm PN16 (100m Roll)', 'price' => 7800, 'compare' => null, 'stock' => 40, 'featured' => false, 'image' => 'pipes.svg', 'sku' => 'PF-HDPE32',
                'short' => 'ISO 4427 certified high-density polyethylene pipe for water supply and irrigation mains.',
                'details' => "Diameter: 32 mm OD | Pressure rating: PN16 (16 bar)\nMaterial: PE100 virgin resin, UV stabilized\nStandard: ISO 4427 / ES standards\nLength: 100 m coil\nJointing: compression fittings or butt/electro-fusion\nColor: black with blue stripe (potable water)\nLifespan: 50+ years buried service"],
            ['category' => 'Pipes & Fittings', 'title' => 'PPR Pipe 25mm PN20 Hot & Cold (4m x 10pcs)', 'price' => 3900, 'compare' => 4400, 'stock' => 60, 'featured' => false, 'image' => 'pipes.svg', 'sku' => 'PF-PPR25',
                'short' => 'German-standard PPR piping bundle for hot and cold plumbing installations.',
                'details' => "Diameter: 25 mm | Wall: PN20 (SDR6)\nTemperature rating: up to 95°C continuous\nStandard: DIN 8077/8078\nBundle: 10 pieces x 4 m (40 m total)\nJointing: heat fusion welding (socket fusion)\nApplication: hot/cold domestic plumbing, hotels, hospitals"],
            ['category' => 'Pipes & Fittings', 'title' => 'PPR Fittings Master Set 25mm (Elbows, Tees, Unions - 50pcs)', 'price' => 2950, 'compare' => null, 'stock' => 35, 'featured' => false, 'image' => 'pipes.svg', 'sku' => 'PF-SET25',
                'short' => 'Contractor pack of the most-used 25mm PPR fittings in one box.',
                'details' => "Contents: 20x elbow 90°, 10x tee, 10x socket/coupling, 5x male union 3/4\", 5x female union 3/4\"\nSize: 25 mm PPR, PN25 rated bodies\nBrass inserts: lead-free CW617N\nCompatible with all standard PPR pipe brands\nIdeal for plumbing contractors and site work"],

            // ---- Valves ----
            ['category' => 'Valves & Controls', 'title' => 'Brass Gate Valve 2" Heavy Duty', 'price' => 1850, 'compare' => 2100, 'stock' => 55, 'featured' => false, 'image' => 'valve.svg', 'sku' => 'VC-GV2',
                'short' => 'Full-bore brass gate valve for mains isolation, rated PN16.',
                'details' => "Size: 2\" BSP female x female\nBody: forged brass CW617N, nickel plated\nStem: non-rising, brass\nPressure: PN16 (16 bar) | Temp: -10°C to 120°C\nStandard: EN 12288\nApplication: building mains, pump stations, tank outlets"],
            ['category' => 'Valves & Controls', 'title' => 'Float Valve 1" with Stainless Ball', 'price' => 950, 'compare' => null, 'stock' => 80, 'featured' => false, 'image' => 'valve.svg', 'sku' => 'VC-FLT1',
                'short' => 'Automatic tank filling control with corrosion-proof stainless float ball.',
                'details' => "Size: 1\" BSP male inlet\nBody: brass | Float: 304 stainless steel ball 120mm\nWorking pressure: 0.2 - 10 bar\nShut-off: drip-tight piston seal\nApplication: roof tanks, reservoirs, livestock troughs"],
            ['category' => 'Valves & Controls', 'title' => 'Pressure Control Switch PC-10 Automatic', 'price' => 1650, 'compare' => 1900, 'stock' => 42, 'featured' => false, 'image' => 'valve.svg', 'sku' => 'VC-PC10',
                'short' => 'Electronic pump controller with dry-run protection and auto restart.',
                'details' => "Model: PC-10/EPC-2 electronic pressure controller\nStart pressure: 1.5 bar (adjustable 1.0-3.5)\nMax current: 10A / 220V\nProtection: dry-running cutoff with auto-retry\nConnections: 1\" male\nReplaces traditional pressure tank + mechanical switch setups"],

            // ---- Tanks ----
            ['category' => 'Tanks & Storage', 'title' => 'Roto Poly Tank 2000L Vertical (Tricolor)', 'price' => 16800, 'compare' => 18500, 'stock' => 12, 'featured' => true, 'image' => 'tank.svg', 'sku' => 'TS-2000V',
                'short' => 'Food-grade 3-layer polyethylene reservoir with UV protection and 5-year warranty.',
                'details' => "Capacity: 2,000 liters\nConstruction: 3-layer roto-molded LLDPE (black inner UV barrier, foam core, colored outer)\nHeight: 160 cm | Diameter: 132 cm\nFittings: 2 x 1\" brass outlets, vented lid, overflow\nFood-grade: WHO drinking water compliant\nWarranty: 5 years manufacturer"],
            ['category' => 'Tanks & Storage', 'title' => 'Stainless Steel Tank 1000L SS304', 'price' => 42500, 'compare' => null, 'stock' => 6, 'featured' => false, 'image' => 'tank.svg', 'sku' => 'TS-SS1000',
                'short' => 'Hygienic polished stainless reservoir for clinics, food processing and premium homes.',
                'details' => "Capacity: 1,000 liters\nMaterial: SS304 food-grade stainless, 0.8mm walls\nFinish: mirror polished exterior\nIncludes: stand legs, 1\" inlet/outlet, drain port, sealed manhole\nAdvantages: zero algae growth, 25+ year lifespan, no taste transfer"],

            // ---- Irrigation ----
            ['category' => 'Irrigation Equipment', 'title' => 'Drip Irrigation Kit 1/4 Hectare Complete', 'price' => 24500, 'compare' => 27900, 'stock' => 10, 'featured' => true, 'image' => 'irrigation.svg', 'sku' => 'IR-DRIP25',
                'short' => 'Everything needed to drip-irrigate 2,500 m² — lines, emitters, filters and fittings.',
                'details' => "Coverage: 2,500 m² (1/4 hectare)\nIncludes: 1,500 m drip line (16mm, 30cm spacing, 2L/h emitters), 100 m HDPE main line 32mm, screen filter 1\", venturi fertilizer injector, valves, connectors, end caps and hole punch\nWater requirement: works from tank gravity (1m+ elevation) or small pump\nCrops: vegetables, fruit trees, khat, coffee seedlings\nIncludes Amharic installation guide"],
            ['category' => 'Irrigation Equipment', 'title' => 'Impact Sprinkler 3/4" Full Circle (Set of 5)', 'price' => 1750, 'compare' => null, 'stock' => 50, 'featured' => false, 'image' => 'irrigation.svg', 'sku' => 'IR-IMP34',
                'short' => 'Adjustable brass-nozzle impact sprinklers covering up to 14m radius each.',
                'details' => "Connection: 3/4\" male thread\nRadius: 8 - 14 m (pressure dependent)\nFlow: 0.4 - 1.1 m³/h @ 2-4 bar\nAdjustment: full or part circle, diffuser pin\nMaterial: engineering plastic body, brass nozzle\nPack: 5 sprinklers"],

            // ---- Meters & Accessories ----
            ['category' => 'Meters & Accessories', 'title' => 'Multi-Jet Water Meter 1/2" Class B Certified', 'price' => 1250, 'compare' => 1450, 'stock' => 90, 'featured' => false, 'image' => 'meter.svg', 'sku' => 'MA-WM12',
                'short' => 'ISO 4064 certified dry-dial water meter for billing and sub-metering.',
                'details' => "Size: DN15 (1/2\")\nType: multi-jet, dry dial, magnetic drive\nClass: B (R100) | Max reading: 99,999 m³\nWorking pressure: 16 bar | Temp: 0.1-40°C\nStandard: ISO 4064\nIncludes: couplings, gaskets and security seal wire"],
            ['category' => 'Meters & Accessories', 'title' => 'Pressure Gauge 0-10 Bar Glycerin Filled 63mm', 'price' => 480, 'compare' => null, 'stock' => 120, 'featured' => false, 'image' => 'meter.svg', 'sku' => 'MA-PG10',
                'short' => 'Vibration-damped pressure gauge for pumps and filtration skids.',
                'details' => "Dial: 63 mm, dual scale bar/psi (0-10 bar / 0-145 psi)\nFill: glycerin (dampens needle vibration)\nConnection: 1/4\" BSP bottom mount, brass internals\nCase: stainless steel\nAccuracy: ±1.6% full scale"],
            ['category' => 'Meters & Accessories', 'title' => 'Flexible Suction Hose 2" Reinforced (Per 6m)', 'price' => 2350, 'compare' => 2650, 'stock' => 28, 'featured' => false, 'image' => 'meter.svg', 'sku' => 'MA-SH2',
                'short' => 'Spiral-reinforced PVC suction hose that won\'t collapse under vacuum.',
                'details' => "Diameter: 2\" (50mm) internal\nLength: 6 m per piece\nConstruction: PVC with rigid PVC helix reinforcement\nTemperature: -5°C to 65°C\nVacuum rating: full suction (no collapse)\nUse: pump suction lines, dewatering, tanker loading"],
        ];

        foreach ($products as $data) {
            $product = Product::create([
                'category_id' => $categoryModels[$data['category']]->id,
                'title' => $data['title'],
                'slug' => Str::slug($data['title']),
                'sku' => $data['sku'],
                'short_description' => $data['short'],
                'details' => $data['details'],
                'price' => $data['price'],
                'compare_at_price' => $data['compare'],
                'stock_quantity' => $data['stock'],
                'is_active' => true,
                'is_featured' => $data['featured'],
                'meta_title' => $data['title'] . ' | Teddy General Trading',
                'meta_description' => Str::limit($data['short'], 155),
                'views' => random_int(40, 900),
            ]);

            $product->images()->create([
                'path' => '/uploads/products/seed/' . $data['image'],
                'alt_text' => $data['title'],
                'sort_order' => 0,
                'is_primary' => true,
            ]);
        }
    }
}
