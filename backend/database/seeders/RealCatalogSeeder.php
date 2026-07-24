<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Builds the storefront catalog from Teddy General Trading's REAL
 * product photography (public/uploads/gallery/photos/gNNN.jpg).
 * Photos are copied into /uploads/products/real/ so product-image
 * management never touches the gallery originals.
 */
class RealCatalogSeeder extends Seeder
{
    public function run(): void
    {
        if (Product::count() > 0) {
            return;
        }

        $categories = [
            ['name' => 'Valves & Controls', 'icon' => 'valve', 'photo' => 'g002', 'description' => 'Gate, butterfly, check, air-release and control valves for water networks.'],
            ['name' => 'Water Meters', 'icon' => 'meter', 'photo' => 'g016', 'description' => 'Certified domestic and bulk (Woltman) water meters for billing and monitoring.'],
            ['name' => 'Pipes & Fittings', 'icon' => 'pipes', 'photo' => 'g049', 'description' => 'HDPE, galvanized and uPVC pipes with compression, fusion and threaded fittings.'],
            ['name' => 'Flanges & Couplings', 'icon' => 'flange', 'photo' => 'g027', 'description' => 'Forged flanges, universal flange adaptors and dismantling joints.'],
            ['name' => 'Bathroom & Sanitary', 'icon' => 'bathroom', 'photo' => 'g008', 'description' => 'Vanities, sinks, faucets, showers and premium sanitary accessories.'],
            ['name' => 'Fire Fighting', 'icon' => 'fire', 'photo' => 'g088', 'description' => 'Pillar hydrants, landing valves and fire protection equipment.'],
            ['name' => 'Pumps, Machinery & Solar', 'icon' => 'pump', 'photo' => 'g077', 'description' => 'Generators, engine pumps, welding machines, power tools and solar panels.'],
        ];

        $categoryModels = [];
        foreach ($categories as $i => $cat) {
            $categoryModels[$cat['name']] = Category::create([
                'name' => $cat['name'],
                'slug' => Str::slug($cat['name']),
                'description' => $cat['description'],
                'icon' => $cat['icon'],
                'image' => $this->productPhoto($cat['photo']),
                'is_active' => true,
                'sort_order' => $i,
            ]);
        }

        foreach ($this->products() as $data) {
            $product = Product::create([
                'category_id' => $categoryModels[$data['category']]->id,
                'title' => $data['title'],
                'slug' => Str::slug($data['title']),
                'sku' => $data['sku'],
                'short_description' => $data['short'],
                'details' => $data['details'],
                'price' => $data['price'],
                'compare_at_price' => $data['compare'] ?? null,
                'stock_quantity' => $data['stock'],
                'is_active' => true,
                'is_featured' => $data['featured'] ?? false,
                'meta_title' => $data['title'] . ' | Teddy General Trading',
                'meta_description' => Str::limit($data['short'], 155),
                'views' => random_int(40, 900),
            ]);

            foreach ($data['photos'] as $index => $photo) {
                $path = $this->productPhoto($photo);
                if (! $path) {
                    continue;
                }
                $product->images()->create([
                    'path' => $path,
                    'alt_text' => $data['title'],
                    'sort_order' => $index,
                    'is_primary' => $index === 0,
                ]);
            }
        }
    }

    /**
     * Copy a gallery photo into the products area (idempotent) and
     * return its public path, or null when the source is missing.
     */
    private function productPhoto(string $name): ?string
    {
        $source = public_path("uploads/gallery/photos/{$name}.jpg");
        if (! is_file($source)) {
            return null;
        }

        $dir = public_path('uploads/products/real');
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $target = $dir . "/{$name}.jpg";
        if (! is_file($target)) {
            copy($source, $target);
        }

        return "/uploads/products/real/{$name}.jpg";
    }

    private function products(): array
    {
        return [
            // ══════════ VALVES & CONTROLS ══════════
            ['category' => 'Valves & Controls', 'title' => 'Ductile Iron Gate Valve — Resilient Seated (DN50–DN300)', 'price' => 8500, 'compare' => 9800, 'stock' => 120, 'featured' => true, 'sku' => 'VLV-GV-DI', 'photos' => ['g002', 'g066', 'g041', 'g052', 'g025', 'g096', 'g097'],
                'short' => 'Heavy-duty flanged gate valve with EPDM-coated wedge for water distribution networks.',
                'details' => "Body & bonnet: Ductile iron GGG50, epoxy coated (blue RAL5015)\nWedge: Ductile iron fully vulcanized with EPDM rubber\nStem: Stainless steel 420 with rolled threads\nSizes: DN50, DN65, DN80, DN100, DN150, DN200, DN250, DN300\nPressure rating: PN10 / PN16\nFlanges: EN 1092-2 drilled\nStandards: EN 1074-1&2, EN 558-1 series 14 (F4)\nApplication: municipal water supply, pump stations, irrigation mains\nOperation: handwheel (cap-top available on request)"],
            ['category' => 'Valves & Controls', 'title' => 'Brass Gate Valve — Threaded (1/2"–4")', 'price' => 950, 'stock' => 200, 'sku' => 'VLV-GV-BR', 'photos' => ['g024', 'g071'],
                'short' => 'Forged brass gate valve with red handwheel for building plumbing lines.',
                'details' => "Body: Forged brass CW617N, nickel-free\nStem: Brass, non-rising\nHandwheel: Aluminium, red powder coat\nSizes: 1/2\", 3/4\", 1\", 1-1/4\", 1-1/2\", 2\", 3\", 4\"\nThreads: BSP female x female (ISO 228)\nPressure: PN16 (16 bar cold water)\nTemperature: -10°C to +110°C\nUse: risers, distribution manifolds, service isolation"],
            ['category' => 'Valves & Controls', 'title' => 'Wafer Butterfly Valve (DN50–DN200)', 'price' => 3800, 'stock' => 85, 'featured' => true, 'sku' => 'VLV-BF-WF', 'photos' => ['g013', 'g065'],
                'short' => 'Compact wafer-type butterfly valve with lever handle and EPDM liner.',
                'details' => "Body: Cast iron GG25, epoxy coated\nDisc: Ductile iron nickel plated (SS304 available)\nSeat: EPDM (potable water grade)\nStem: Stainless steel 416\nSizes: DN50 – DN200 (lever), up to DN600 (gear box)\nPressure: PN10/PN16, bubble-tight shut-off\nMounting: wafer between EN 1092 flanges\nOptions: lever lock plate, gear operator, bare shaft for actuation"],
            ['category' => 'Valves & Controls', 'title' => 'Ductile Iron Check Valve — Ball & Dual-Plate', 'price' => 6200, 'stock' => 60, 'sku' => 'VLV-CK-DI', 'photos' => ['g060', 'g051', 'g063'],
                'short' => 'Non-return valves for pump lines — free-rolling ball type and wafer dual-plate type.',
                'details' => "Ball check valve:\n• Body ductile iron GGG50, epoxy coated\n• Full-bore, self-cleaning NBR-coated ball\n• Sizes DN50–DN300, PN10/16, flanged EN 1092-2\n\nDual-plate wafer check valve:\n• Spring-loaded SS304 plates, EPDM seal\n• Ultra-short face-to-face, fits between flanges\n• Sizes DN50–DN300, PN16\n\nApplication: pump discharge, prevention of backflow and water hammer"],
            ['category' => 'Valves & Controls', 'title' => 'Brass Swing Check Valve (Horizontal)', 'price' => 1450, 'stock' => 150, 'sku' => 'VLV-CK-BR', 'photos' => ['g086', 'g087'],
                'short' => 'Classic brass swing-type non-return valve for domestic and light commercial lines.',
                'details' => "Body: Brass CW617N with bronze finish\nDisc: Brass with NBR seal\nSizes: 1/2\" – 4\" BSP female\nPressure: PN16\nMounting: horizontal line (arrow in flow direction)\nTemperature: up to 100°C\nUse: after meters, pump outlets, boiler feeds"],
            ['category' => 'Valves & Controls', 'title' => 'Automatic Air Release Valve (Single & Double Orifice)', 'price' => 5400, 'stock' => 45, 'sku' => 'VLV-AR-DO', 'photos' => ['g058', 'g059', 'g064'],
                'short' => 'Releases trapped air from pipelines automatically — protects against airlocks and surge.',
                'details' => "Type: single orifice (small air pockets) & double orifice (large air discharge during filling)\nBody: Ductile iron, epoxy coated\nFloat: ABS / stainless steel\nSizes: DN25 threaded; DN50–DN200 flanged\nPressure: PN10/PN16\nInstallation: at pipeline high points, after pumps, on long transmission mains\nStandard: EN 1074-4"],
            ['category' => 'Valves & Controls', 'title' => 'Y-Strainer — Threaded & Flanged', 'price' => 2900, 'stock' => 70, 'sku' => 'VLV-YS', 'photos' => ['g055', 'g053'],
                'short' => 'Protects meters, pumps and valves from debris with a removable stainless screen.',
                'details' => "Body: Ductile/cast iron epoxy coated (brass for small threaded sizes)\nScreen: Stainless steel 304, 1.2mm perforation (finer mesh on request)\nSizes: 1/2\"–2\" threaded BSP; DN50–DN300 flanged PN16\nBlow-down: plugged drain port for cleaning without removal\nInstall upstream of: water meters, control valves, pumps, RO systems"],
            ['category' => 'Valves & Controls', 'title' => 'Foot Valve with Strainer (Flanged)', 'price' => 3200, 'stock' => 55, 'sku' => 'VLV-FT', 'photos' => ['g054', 'g062'],
                'short' => 'Keeps suction lines primed and blocks debris at the pump intake.',
                'details' => "Body: Ductile iron GGG50, epoxy coated\nStrainer: Stainless steel basket, large free area\nSeal: EPDM disc, low opening pressure\nSizes: DN50 – DN300, PN10/16 flanged\nMounting: vertical, submerged at suction intake\nApplication: river/tank suction lines, borehole surface pumps, fire pump intakes"],
            ['category' => 'Valves & Controls', 'title' => 'Angle Globe Control Valve (DI, Flanged)', 'price' => 7800, 'stock' => 25, 'sku' => 'VLV-GB-ANG', 'photos' => ['g056'],
                'short' => 'Right-angle pattern globe valve for precise flow regulation and tank inlet control.',
                'details' => "Body: Ductile iron, epoxy coated blue\nTrim: Bronze/stainless seat, EPDM disc\nPattern: 90° angle — replaces valve + elbow in one fitting\nSizes: DN50 – DN150, PN16\nDuty: throttling and shut-off, float-pilot compatible for reservoir inlet control\nFlanges: EN 1092-2"],

            // ══════════ WATER METERS ══════════
            ['category' => 'Water Meters', 'title' => 'Domestic Water Meter — Dry Dial (1/2"–1")', 'price' => 1850, 'stock' => 300, 'featured' => true, 'sku' => 'WM-DOM', 'photos' => ['g016'],
                'short' => 'ISO 4064 Class B certified household billing meter with sealed dry register.',
                'details' => "Type: Single/multi-jet, dry dial, magnetic drive\nSizes: DN15 (1/2\"), DN20 (3/4\"), DN25 (1\")\nClass: B (R100) horizontal\nMax pressure: 16 bar | Temp: 0.1–40°C\nRegister: 8-digit, 360° rotatable, anti-fog\nBody: Brass, blue protective cap\nIncludes: tail couplings, gaskets, security seal wire\nStandard: ISO 4064 / OIML R49 — accepted by Ethiopian utilities"],
            ['category' => 'Water Meters', 'title' => 'Woltman Bulk Water Meter — Flanged (DN50–DN300)', 'price' => 24500, 'stock' => 30, 'featured' => true, 'sku' => 'WM-WOLT', 'photos' => ['g042', 'g050', 'g095', 'g047', 'g048'],
                'short' => 'Helical-turbine bulk meter for buildings, industry and district metering.',
                'details' => "Type: Woltman horizontal helix (WPH), dry dial, magnetic transmission\nSizes: DN50, DN65, DN80, DN100, DN150, DN200, DN300 — flanged PN16\nClass: B | Starting flow as low as 0.09 m³/h (DN50)\nRegister: sealed 8-digit with pointer test circle, pulse-output ready (reed switch option)\nBody: Ductile iron epoxy coated; internals removable without de-piping\nApplication: apartment blocks, factories, irrigation off-takes, DMA metering\nStandard: ISO 4064 Class B"],

            // ══════════ PIPES & FITTINGS ══════════
            ['category' => 'Pipes & Fittings', 'title' => 'HDPE Pipe Roll PE100 (20mm–110mm, PN10/PN16)', 'price' => 6800, 'stock' => 150, 'featured' => true, 'sku' => 'PF-HDPE', 'photos' => ['g049'],
                'short' => 'Flexible blue-striped PE100 pressure pipe in 50m and 100m coils.',
                'details' => "Material: PE100 virgin resin, black with blue co-extruded stripes\nSizes: 20, 25, 32, 40, 50, 63, 75, 90, 110 mm OD\nPressure: PN10 & PN16 (SDR17 / SDR11)\nCoils: 50 m and 100 m (larger diameters straight lengths on order)\nStandards: ISO 4427 / EN 12201, potable water approved\nJointing: compression fittings or butt/electro-fusion\nPrice shown: 32mm PN16 100m roll — call for full size list"],
            ['category' => 'Pipes & Fittings', 'title' => 'Galvanized Steel Pipes & Fabricated Bends', 'price' => 3400, 'stock' => 500, 'sku' => 'PF-GI-PIPE', 'photos' => ['g040', 'g043', 'g039'],
                'short' => 'Hot-dip galvanized steel pipes (1/2"–6") plus custom fabricated large-diameter bends.',
                'details' => "Pipes:\n• Sizes 1/2\" – 6\", 6 m lengths, threaded & socketed\n• Hot-dip galvanized inside & out, BS EN 10255 (medium class)\n\nFabricated fittings:\n• Large diameter segmented bends, reducers and specials made to order\n• Materials: galvanized or epoxy-coated steel\n\nApplication: risers, borehole drop pipes, industrial lines, structural work\nPrice shown: 1\" medium class 6 m length"],
            ['category' => 'Pipes & Fittings', 'title' => 'HDPE Compression Fittings (20mm–110mm)', 'price' => 350, 'stock' => 800, 'sku' => 'PF-COMP', 'photos' => ['g036', 'g073'],
                'short' => 'Push-and-tighten PP compression couplers, elbows, tees and adaptors for HDPE pipe.',
                'details' => "Range: couplings, reducing couplings, elbows 90°, tees, end caps, male/female adaptors, saddle outlets\nSizes: 20 – 110 mm\nBody: PP-B with POM grip ring, NBR O-ring seal\nPressure: PN16 (up to 63mm), PN10 above\nStandards: ISO 14236 — no tools needed up to 63mm\nUse: farm lines, service connections, repairs — reusable\nPrice shown: 32mm coupling — full range in store"],
            ['category' => 'Pipes & Fittings', 'title' => 'HDPE Butt-Fusion Fittings (63mm–315mm)', 'price' => 480, 'stock' => 600, 'sku' => 'PF-FUSION', 'photos' => ['g037'],
                'short' => 'PE100 long-spigot elbows, tees, reducers and stub ends for welded pipelines.',
                'details' => "Range: elbows 45°/90°, equal & reducing tees, reducers, end caps, stub ends with backing rings\nMaterial: PE100 SDR11/SDR17, injection molded\nSizes: 63 – 315 mm\nJointing: butt-fusion (we also sell & rent welding machines)\nStandards: EN 12201-3 / ISO 4427-3\nApplication: transmission mains, pump manifolds, irrigation headworks\nPrice shown: 63mm 90° elbow"],
            ['category' => 'Pipes & Fittings', 'title' => 'PP Clamp Saddles / Tapping Saddles', 'price' => 220, 'stock' => 900, 'sku' => 'PF-SADDLE', 'photos' => ['g026'],
                'short' => 'Bolt-on saddle outlets for making branch connections on HDPE and PVC mains.',
                'details' => "Body: PP with stainless bolts, NBR gasket\nMain sizes: 25 – 160 mm\nOutlets: 1/2\" – 2\" BSP female\nPressure: PN10/PN16\nInstall: clamp on, drill through outlet — no pipe cutting required\nUse: house connections, irrigation take-offs, air valve mounting\nPrice shown: 63mm x 1\" saddle"],
            ['category' => 'Pipes & Fittings', 'title' => 'GI Malleable Iron Fittings (Full Range)', 'price' => 180, 'stock' => 1500, 'sku' => 'PF-GI-FIT', 'photos' => ['g034', 'g029', 'g033', 'g072', 'g082', 'g074', 'g068'],
                'short' => 'Galvanized elbows, tees, sockets, unions, nipples and bushes — every size in stock.',
                'details' => "Range: elbows 90°/45°, equal & reducing tees, sockets, unions (conical seat), hex nipples, reducing bushes, plugs, caps, crosses\nMaterial: malleable cast iron, hot-dip galvanized (black iron available)\nBrass and bronze-finish fittings also stocked\nSizes: 1/4\" – 4\" BSP\nStandards: EN 10242 / ISO 49, banded pattern\nPressure: PN25 (cold water)\nPrice shown: 1/2\" elbow — volume discounts for contractors"],
            ['category' => 'Pipes & Fittings', 'title' => 'uPVC Fittings & Ball Valves', 'price' => 260, 'stock' => 700, 'sku' => 'PF-UPVC', 'photos' => ['g083'],
                'short' => 'Solvent-weld uPVC elbows, tees, unions and true-union ball valves.',
                'details' => "Range: elbows, tees, couplings, unions, male/female adaptors, true-union ball valves, foot valves\nMaterial: uPVC, dark blue/grey\nSizes: 20 – 110 mm (solvent cement joint)\nPressure: PN10/PN16\nStandards: DIN 8063 / ISO 727\nUse: water treatment skids, pool lines, chemical dosing, cold water distribution\nPrice shown: 32mm elbow"],
            ['category' => 'Pipes & Fittings', 'title' => 'Ductile Iron Flanged Fittings — Bends & Tees', 'price' => 4900, 'stock' => 90, 'sku' => 'PF-DI-FIT', 'photos' => ['g085', 'g089', 'g093'],
                'short' => 'Flanged DI bends, tees, reducers and socketed fittings for transmission mains.',
                'details' => "Range: 90°/45° double-flanged bends, all-flanged tees, tapers, duckfoot bends, blank flanges, socket fittings for push-in DI pipe\nMaterial: Ductile iron GGG50, fusion-bonded epoxy or bitumen coated\nSizes: DN50 – DN600\nFlanges: EN 1092-2 PN10/PN16\nStandards: EN 545 / ISO 2531\nApplication: municipal mains, pump station manifolds, hydrant risers\nPrice shown: DN80 90° double-flanged bend"],
            ['category' => 'Pipes & Fittings', 'title' => 'EXPART Thread Sealant & PTFE (Made in Spain)', 'price' => 480, 'stock' => 350, 'sku' => 'PF-SEAL', 'photos' => ['g014', 'g015'],
                'short' => 'Professional anaerobic thread sealant and high-density PTFE for leak-free joints.',
                'details' => "EXPART liquid thread sealant:\n• Seals metal threads up to 4\" — replaces hemp & paste\n• Rated for all pressures of building services\n• Potable water safe, vibration resistant\n\nEXPART PTFE tape (high density):\n• For gas and water threads, made in Spain\n\nCoverage: ±150 joints per 50ml bottle\nCure: hand-tight seal immediately, full cure 24h"],

            // ══════════ FLANGES & COUPLINGS ══════════
            ['category' => 'Flanges & Couplings', 'title' => 'Forged Steel Flanges (Slip-On, Weld-Neck, Blind)', 'price' => 850, 'stock' => 400, 'sku' => 'FL-STEEL', 'photos' => ['g027', 'g028', 'g038', 'g067'],
                'short' => 'Carbon steel flanges in all patterns — drilled to EN 1092 / ANSI on request.',
                'details' => "Patterns: slip-on (SO), weld-neck (WN), blind (BL), threaded, plate flanges\nMaterial: Carbon steel S235/A105, natural or zinc coated\nSizes: DN15 – DN600 (1/2\" – 24\")\nRatings: PN10 / PN16 / PN25 (EN 1092-1) and ANSI 150#\nIncludes: gaskets and bolt sets available in store\nCustom drilling and fabrication service available\nPrice shown: DN50 PN16 slip-on"],
            ['category' => 'Flanges & Couplings', 'title' => 'Universal Flange Adaptor & Dismantling Joint', 'price' => 5600, 'stock' => 65, 'sku' => 'FL-ADAPT', 'photos' => ['g031', 'g035'],
                'short' => 'Wide-tolerance couplings that join and allow easy removal of flanged equipment.',
                'details' => "Universal flange adaptor:\n• Connects plain-end pipe (DI, steel, PVC, HDPE) to flanged fittings\n• Wide tolerance range per size, EPDM gasket\n\nDismantling joint:\n• Adjustable face-to-face for valve/meter installation & removal\n• Double flanged with tie bars\n\nSizes: DN50 – DN600, PN10/16\nBody: Ductile iron, fusion-bonded epoxy\nApplication: pump rooms, meter chambers, valve replacement without pipe cutting"],

            // ══════════ BATHROOM & SANITARY ══════════
            ['category' => 'Bathroom & Sanitary', 'title' => 'Bathroom Vanity Cabinet with Designer Mirror', 'price' => 28500, 'compare' => 32000, 'stock' => 12, 'featured' => true, 'sku' => 'BS-VANITY', 'photos' => ['g008', 'g009'],
                'short' => 'Modern wall-hung vanity with ceramic basin and geometric-frame mirror.',
                'details' => "Cabinet: Moisture-resistant plywood, soft-close drawers, wall-hung\nBasin: Integrated ceramic countertop basin\nMirror: Designer black geometric frame (LED backlit option)\nWidth options: 60 / 80 / 100 cm\nFinish: matte grey/stone pattern (see photos)\nIncludes: fixing kit, siphon and flexible hoses\nFaucet sold separately — see our faucet collection"],
            ['category' => 'Bathroom & Sanitary', 'title' => 'Stainless Steel Kitchen Sink (Single & Double Bowl)', 'price' => 7200, 'stock' => 35, 'sku' => 'BS-SINK', 'photos' => ['g006', 'g007'],
                'short' => 'Brushed SUS304 handmade sinks with waste kit and anti-condensation coating.',
                'details' => "Material: SUS304 stainless steel, 1.0–1.2 mm handmade construction\nStyles: single bowl 60x45, double bowl 78x43, with/without drainboard\nDepth: 20–23 cm deep bowls\nIncludes: basket strainer waste, overflow, anti-noise pads, mounting clips\nInstallation: top-mount or under-mount\nAccessory siphons and bottle traps in stock"],
            ['category' => 'Bathroom & Sanitary', 'title' => 'Luxury Shower Column Set — Gold Finish', 'price' => 15800, 'compare' => 18500, 'stock' => 10, 'featured' => true, 'sku' => 'BS-SHOWER-G', 'photos' => ['g004'],
                'short' => 'Statement brushed-gold rainfall shower panel with hand shower and mixer.',
                'details' => "Finish: PVD brushed gold (fade & scratch resistant)\nRain head: 25 x 25 cm ultra-slim, anti-limescale nozzles\nIncludes: thermostatic/manual mixer bar, 3-function hand shower, adjustable riser\nBody: SUS304 stainless steel + solid brass valves\nWorking pressure: 1–5 bar\nBoxed complete with fixings — matching accessories available"],
            ['category' => 'Bathroom & Sanitary', 'title' => 'Designer Basin Faucet — Chrome Series', 'price' => 3400, 'stock' => 60, 'sku' => 'BS-TAP-CH', 'photos' => ['g018', 'g020', 'g022'],
                'short' => 'Contemporary single-lever basin mixers in polished chrome — multiple spout styles.',
                'details' => "Body: Solid brass, polished chrome plated (10-layer)\nCartridge: 35mm ceramic disc, 500,000-cycle rated\nAerator: Neoperl®-type, 6 L/min water saving\nStyles: waterfall spout, high-rise, standard basin (see photos)\nConnection: 1/2\" flexible hoses included\nMounting: single-hole deck mount\nWarranty: 5 years on cartridge, 2 years on finish"],
            ['category' => 'Bathroom & Sanitary', 'title' => 'Designer Basin Faucet — Brushed Gold', 'price' => 4200, 'stock' => 40, 'sku' => 'BS-TAP-GD', 'photos' => ['g017'],
                'short' => 'Premium brushed-gold basin mixer that pairs with our gold shower collection.',
                'details' => "Body: Solid brass with PVD brushed gold finish\nCartridge: 35mm ceramic disc\nFlow: 6 L/min aerated, soft stream\nMounting: single-hole, includes flexible hoses & fixing kit\nMatching items: gold shower column, gold bottle trap, gold angle valves in stock\nCare: wipe with soft cloth only — no abrasives\nWarranty: 5 years cartridge, 2 years finish"],
            ['category' => 'Bathroom & Sanitary', 'title' => 'Brass Bibcock Tap (Garden/Utility)', 'price' => 680, 'stock' => 250, 'sku' => 'BS-BIB', 'photos' => ['g070'],
                'short' => 'Heavy brass quarter-turn bibcock for gardens, garages and utility points.',
                'details' => "Body: Solid brass, natural or chrome finish\nSizes: 1/2\" and 3/4\" BSP male inlet\nOutlet: hose union nose (13mm hose)\nMechanism: quarter-turn ceramic or long-life gland packing\nPressure: PN10\nUse: outdoor taps, tanker filling, washing bays"],
            ['category' => 'Bathroom & Sanitary', 'title' => 'Wall-Mounted Soap Dispenser (Chrome & Black)', 'price' => 1250, 'stock' => 80, 'sku' => 'BS-DISP', 'photos' => ['g003'],
                'short' => 'Refillable 400ml liquid soap dispensers for hotels, offices and homes.',
                'details' => "Capacity: 400 ml refillable tank\nFinishes: polished chrome, matte black, brushed steel\nBody: ABS + stainless steel cover\nMounting: concealed wall bracket (screws + adhesive options)\nPump: one-hand press, ±1ml per stroke\nAlso available: double dispensers, sanitizer versions"],
            ['category' => 'Bathroom & Sanitary', 'title' => 'Jumbo Toilet Roll Dispenser', 'price' => 1450, 'stock' => 65, 'sku' => 'BS-ROLL', 'photos' => ['g005'],
                'short' => 'Lockable high-capacity roll dispenser for commercial washrooms.',
                'details' => "Fits: jumbo rolls up to 300 m (Ø 25 cm)\nBody: impact-resistant ABS, white (satin option)\nLock: keyed, with viewing window for stock level\nMounting: wall screws included\nIdeal for: hotels, restaurants, offices, mosques, schools"],
            ['category' => 'Bathroom & Sanitary', 'title' => 'Bathroom Accessories & Hardware Collection', 'price' => 2900, 'stock' => 45, 'sku' => 'BS-ACC', 'photos' => ['g001', 'g012', 'g011'],
                'short' => 'Towel rails, hooks, shelves, paper holders and corner baskets — chrome, black & gold.',
                'details' => "Collection includes: towel bars & rings, robe hooks, glass shelves, paper holders, corner baskets, toilet brush sets\nFinishes: chrome, matte black, brushed gold\nMaterial: SUS304 stainless / solid brass depending on item\nMounting: concealed fix, all fasteners included\nPrice shown: 4-piece starter set (bar, ring, hook, paper holder)\nMix & match — full display wall in our showroom"],
            ['category' => 'Bathroom & Sanitary', 'title' => 'Chrome Floor Drain (Anti-Odor)', 'price' => 520, 'stock' => 300, 'sku' => 'BS-DRAIN', 'photos' => ['g021', 'g030'],
                'short' => 'Square stainless/brass floor drains with removable anti-odor cartridge.',
                'details' => "Sizes: 10x10 cm and 15x15 cm\nBody: brass or SUS304, chrome finish (gold available)\nOutlet: 50mm (2\") vertical\nFeatures: removable hair filter, deep-seal anti-odor core, tile-recess models\nUse: bathrooms, balconies, laundry rooms, commercial kitchens"],
            ['category' => 'Bathroom & Sanitary', 'title' => 'One-Piece Toilet & Pedestal Basin Set', 'price' => 11500, 'stock' => 20, 'sku' => 'BS-WC-SET', 'photos' => ['g069'],
                'short' => 'Washdown one-piece WC with soft-close seat plus matching pedestal basin.',
                'details' => "Toilet (model 3011):\n• One-piece washdown, dual flush 3/6L\n• S-trap 250/300mm, soft-close seat included\n• Size: 700 x 365 x 760 mm\n\nPedestal basin (model 717):\n• Size: 560 x 435 x 850 mm, single tap hole\n\nCeramic: high-temperature fired, self-clean glaze\nIncludes: fixing kits, wax ring, flexible hose"],
            ['category' => 'Bathroom & Sanitary', 'title' => 'Automatic Hand Dryer — Stainless Steel', 'price' => 8900, 'stock' => 15, 'sku' => 'BS-DRYER', 'photos' => ['g079'],
                'short' => 'Fast infrared-sensor hand dryer for commercial washrooms.',
                'details' => "Body: brushed stainless steel, vandal resistant\nPower: 1800W, 220–240V\nActivation: infrared sensor, auto stop\nDry time: 10–15 seconds\nAir speed: 95 m/s | Noise: <72 dB\nMounting: wall bracket included, IPX1\nIdeal for: hotels, restaurants, offices, hospitals"],

            // ══════════ FIRE FIGHTING ══════════
            ['category' => 'Fire Fighting', 'title' => 'Pillar Fire Hydrant (Two & Three Way)', 'price' => 32000, 'stock' => 14, 'featured' => true, 'sku' => 'FF-HYDRANT', 'photos' => ['g088', 'g091'],
                'short' => 'Above-ground pillar hydrants with instantaneous couplings for fire brigade use.',
                'details' => "Type: dry-barrel pillar hydrant, red epoxy finish\nOutlets: 2 x 65mm + 1 x 100mm (three-way) or 2 x 65mm (two-way)\nInlet: DN80/DN100 flanged EN 1092-2\nBody: Ductile iron GGG50; stem SS420\nWorking pressure: PN16\nStandards: EN 14384 / GB4452 pattern\nOptions: breakable safety flange, underground screw type\nCommissioning & spare caps available"],
            ['category' => 'Fire Fighting', 'title' => 'Fire Hydrant Landing Valve (Oblique, 2.5")', 'price' => 5800, 'stock' => 40, 'sku' => 'FF-LANDING', 'photos' => ['g061'],
                'short' => 'Red oblique landing valves for standpipe and wet-riser cabinets.',
                'details' => "Type: oblique pattern landing valve\nInlet: 2.5\" (65mm) flanged or female thread\nOutlet: 65mm instantaneous coupling (British type)\nBody: bronze/gunmetal or ductile iron, red finish\nPressure: PN16, tested to 24 bar\nStandards: BS 5041 pattern\nUse: building wet risers, hose reel cabinets, yard hydrant points"],

            // ══════════ PUMPS, MACHINERY & SOLAR ══════════
            ['category' => 'Pumps, Machinery & Solar', 'title' => 'Portable Gasoline Generator (2.5–7.5 kVA)', 'price' => 42000, 'stock' => 8, 'featured' => true, 'sku' => 'PM-GEN', 'photos' => ['g077', 'g076'],
                'short' => 'Reliable air-cooled petrol generators with AVR — power for shops, homes and sites.',
                'details' => "Engine: 4-stroke OHV air-cooled, recoil + electric start (larger models)\nOutputs: 2.5, 3.5, 5.5, 7.5 kVA — 220V/50Hz with AVR\nTank: 15–25 L (8–12 hours @ 50% load)\nOutlets: 2 x 220V sockets + 12V DC\nProtection: low-oil shutdown, circuit breaker\nFrame: steel roll cage, wheel kit on larger models\nService parts and oil in stock"],
            ['category' => 'Pumps, Machinery & Solar', 'title' => 'Gasoline Engine Water Pump (2" & 3")', 'price' => 26500, 'stock' => 12, 'sku' => 'PM-ENGPUMP', 'photos' => ['g080'],
                'short' => 'Self-priming engine pumps moving up to 60 m³/h for irrigation and dewatering.',
                'details' => "Engine: 6.5–9 HP 4-stroke gasoline, recoil start\nSizes: 2\" (36 m³/h) and 3\" (60 m³/h)\nMax head: 28–32 m | Suction: 8 m\nPump: self-priming, cast aluminium body, silicon-carbide seal\nIncludes: suction strainer, hose couplings, spark plug spanner\nUse: irrigation from rivers, construction dewatering, emergency supply"],
            ['category' => 'Pumps, Machinery & Solar', 'title' => 'HDPE Butt-Fusion Welding Machine (63–250mm)', 'price' => 95000, 'stock' => 4, 'sku' => 'PM-WELD', 'photos' => ['g075'],
                'short' => 'Complete hydraulic butt-welding set for PE pipes — rental option available.',
                'details' => "Range: 63 – 250 mm (90–315mm model available)\nIncludes: machine body with 4 clamps, hydraulic unit, milling cutter, PTFE-coated heating plate, inserts set, support trolley\nPower: 220V, heater 1.5kW + cutter 0.8kW\nControls: digital temperature, pressure gauge with drag needle\nStandards: welds to ISO 21307 / DVS 2207\nRENTAL: daily/weekly rental with operator training available"],
            ['category' => 'Pumps, Machinery & Solar', 'title' => 'Professional Power Tools (Drills & Grinders)', 'price' => 12500, 'stock' => 18, 'sku' => 'PM-TOOLS', 'photos' => ['g078'],
                'short' => 'Site-grade rotary hammers, impact drills and angle grinders.',
                'details' => "In stock:\n• Rotary hammer drills SDS-plus 800–1500W\n• Impact drills 13mm 750W\n• Angle grinders 115/230mm\n• Accessories: SDS bits, core bits, cutting & grinding discs\nAll tools: industrial copper-wound motors, 6-month warranty\nPrice shown: 1500W rotary hammer with case & bits"],
            ['category' => 'Pumps, Machinery & Solar', 'title' => 'Stainless Steel Welding Electrodes (308/316)', 'price' => 1850, 'stock' => 120, 'sku' => 'PM-ELECTRODE', 'photos' => ['g084'],
                'short' => 'A102/A302 stainless electrodes for tank, rail and sanitary fabrication.',
                'details' => "Grades: A102 (E308-16), A302 (E309-16), A132, A022 and more\nDiameters: 2.5mm / 3.2mm / 4.0mm\nPacking: 1 kg and 5 kg sealed boxes\nCurrent: AC/DC+, all-position\nUse: stainless tanks, handrails, food-grade piping, dissimilar joints\nStore dry — re-bake 250°C/1h if damp"],
            ['category' => 'Pumps, Machinery & Solar', 'title' => '550W Monocrystalline Solar Panel', 'price' => 19500, 'stock' => 25, 'sku' => 'PM-SOLAR550', 'photos' => ['g044'],
                'short' => 'High-efficiency 550W mono panel for solar pumping and off-grid power.',
                'details' => "Power: 550W ±3% | Efficiency: 21.3%\nCells: monocrystalline PERC, half-cut 144 cells\nVoc: 49.9V | Vmp: 41.96V | Imp: 13.11A\nSize: 2279 x 1134 x 35 mm | Weight: 28.5 kg\nFrame: anodized aluminium, IP68 junction box, MC4 connectors\nWarranty: 12 years product / 25 years 84.8% output\nPairs with our solar pump controllers and structures"],
        ];
    }
}
