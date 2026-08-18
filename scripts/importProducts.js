/**
 * Bulk-imports the Virtualsphere product datasheets (c:\DEVELOPMENT\rfid\products\*.pdf)
 * into this backend via its own admin HTTP API.
 *
 * This script does NOT touch the database directly and does NOT start the server —
 * point API_URL at wherever the backend is actually running (local, staging, or prod).
 *
 * The prices below are PLACEHOLDERS (rough ballpark, INR) — edit the PRICES table
 * to real numbers before/after running; re-running the script is safe (see below),
 * but note the API also lets you edit price per-product afterwards from the admin
 * Products page instead of re-running this script.
 *
 * Setup: set env vars and run from the rfid-backend folder:
 *
 *   API_URL=https://your-deployed-backend/api \
 *   ADMIN_EMAIL=you@example.com \
 *   ADMIN_PASSWORD=yourpassword \
 *   node scripts/importProducts.js
 *
 *   ADMIN_EMAIL must belong to a user with role "admin" (see authController's
 *   SUPER_ADMIN_EMAIL auto-promotion, or set the role directly in the DB).
 *
 * The script is idempotent: categories are matched/created by name, and products
 * are matched/created by SKU, so re-running it after fixing a price or a typo
 * will only create what's missing (it will NOT overwrite an already-created
 * product's price — edit those in the admin UI once they're live).
 */

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// --- Placeholder prices (INR) — rough ballpark, not real quotes. Edit freely. ---
const PRICES = {
  'VST-UDM9A': 15000,     // UDM9A — RFID UHF Integrated Reader
  'VST-DBP01': 12000,     // Desktop Barcode Printer
  'VST-HRD13': 1200,      // HRD13 — RFID HF Mifare Reader
  'VST-HRP70': 1200,      // HRP70 — RFID HF Pendrive Reader
  'VST-LRP70': 1200,      // LRP70 — RFID LF Pendrive Reader
  'VST-PBR3': 8000,       // PBR3 — RFID UHF Bluetooth Handheld Reader
  'VST-SIL5015': 25,      // VST SIL 5015 — RFID Silicon Tag (per unit)
  'ACS-ACR122U': 3500,    // ACR122U — USB NFC Reader/Writer
  'VST-UA9': 3500,        // UA9 — RFID UHF 9dBi Antenna
  'VST-UCA3': 1500,       // UCA3 — RFID UHF Ceramic Antenna
  'VST-UDM9R': 18000,     // UDM9R — RFID UHF Integrated Reader
  'VST-UDRW101': 6000,    // UDR-W101 — RFID UHF Desktop Reader
  'VST-UDRW105': 7000,    // UDR-W105 — RFID UHF Desktop Reader
  'VST-UDR102': 6500,     // UDR102 — RFID UHF Desktop Reader
  'VST-UDT9R': 20000,     // UDT9R — RFID Smart Tray Reader
  'VST-UHR2': 45000,      // UHR2 — RFID UHF Handheld Reader
  'VST-VSLA1': 35000,     // VSL-A1 — RFID Fixed Reader
  'VST-VSLA4': 32000,     // VSL-A4 — RFID Fixed Reader (4-channel)
  'VST-TEX7015': 20,      // VST TEX 7015 — RFID Textile Tag (per unit)
};

// Flat category list. Matches the taxonomy given for the existing product line;
// "Barcode Printers" and "RFID Tags" are new — added because the source
// datasheets (printer, silicon tag, textile tag) don't fit the existing readers/
// antenna categories. Adjust the `category` field on any product below if you'd
// rather file them differently.
const CATEGORIES = [
  'RFID UHF Desktop Reader',
  'RFID UHF Reader / INTEGRATED Reader',
  'RFID UHF Reader',
  '4-Port Reader',
  'RFID UHF Antenna',
  'RFID Handheld Reader',
  'HF Reader',
  'LF Reader',
  'NFC/HF Reader & Writer',
  'Barcode Printers',
  'RFID Tags',
];

function specs(pairs) {
  return pairs.map(([name, value]) => ({ name, value }));
}

function description(overview, features) {
  const featureList = features.map((f) => `<li>${f}</li>`).join('');
  return `<p>${overview}</p><p><strong>Key Features</strong></p><ul>${featureList}</ul>`;
}

const PRODUCTS = [
  {
    name: 'UDM9A RFID UHF Integrated Reader',
    model: 'UDM9A',
    sku: 'VST-UDM9A',
    category: 'RFID UHF Reader / INTEGRATED Reader',
    description: description(
      'The UDM9A is a rugged, IP65-rated integrated UHF RFID reader from Virtualsphere, built around a high-performance Chinese RFID reader module compliant with ISO18000-6C (EPC Gen2). Combining a long-range circular-polarized antenna, adjustable RF output, and flexible Wiegand/RS232/POE/WiFi connectivity, the UDM9A is designed for access control, vehicle identification, warehousing, and asset-tracking deployments that demand reliable outdoor performance.',
      [
        'Long read range up to 15 meters with adjustable RF power (0–33dBm)',
        'High-sensitivity Chinese-made RFID reader module, ISO18000-6C / EPC Gen2 compliant',
        'IP68-rated ABS + metal enclosure for indoor and outdoor installation',
        'Multiple I/O options: RS232, Wiegand, Relay, POE, optional WiFi',
        'Rich SDK with demo software, APIs and sample code in C#, Java, Python, Delphi, VB',
        'Online firmware upgrade (OTA) support',
      ]
    ),
    specifications: specs([
      ['Frequency', '902~928MHz (US/FCC), 865~868MHz (EU/ETSI)'],
      ['Protocol', 'ISO18000-6C (EPC Gen2 V2)'],
      ['RF Output Power', '0dBm~26dBm (Adjustable)'],
      ['Built-in Antenna', '9dBi circular polarized antenna'],
      ['Reading Distance', 'Up to 0-15 meters (tag & antenna dependent)'],
      ['Multi-tag Read Rate', '>300 tags/second'],
      ['Chassis Material', 'ABS + Aluminum enclosure'],
      ['Dimensions', '260 x 260 x 60 mm'],
      ['Net Weight', 'Approx. 1.2 kg'],
      ['Standard Interface', 'RS232, Wiegand, Relay'],
      ['Optional Interface', 'WiFi, POE'],
      ['Power Supply', 'DC 12V / 2A'],
      ['Development Language', 'C#, Delphi, Java, Python, VB'],
    ]),
  },
  {
    name: 'Desktop Barcode Printer',
    model: 'Desktop Barcode Printer',
    sku: 'VST-DBP01',
    category: 'Barcode Printers',
    description: description(
      'A versatile desktop barcode printer designed for high-quality label printing. Supports both Direct Thermal and Thermal Transfer methods with multiple resolution options (203/300/600 dpi) to meet diverse application requirements.',
      [
        'Triple resolution support: 203 dpi, 300 dpi, and 600 dpi for precise printing',
        'Dual printing technology: Direct Thermal and Thermal Transfer',
        'High-speed printing up to 5 inches per second (203 dpi)',
        'Compact desktop design: 270 x 170 x 240 mm',
        'Multiple connectivity options: USB 2.0 and Ethernet 10/100Mbps',
        'Wide range of supported barcode symbologies including 1D and 2D codes',
      ]
    ),
    specifications: specs([
      ['Print Method', 'Direct Thermal / Thermal Transfer'],
      ['Resolution', '203 dpi / 300 dpi / 600 dpi'],
      ['Print Speed', '5 IPS (203 dpi) / 4 IPS (300 dpi) / 3 IPS (600 dpi)'],
      ['Print Width', '108 mm (203 dpi), 106 mm (300/600 dpi)'],
      ['Media Width', '25.4 mm ~ 118 mm'],
      ['Ribbon Type', 'Wax, Wax/Resin, Resin'],
      ['Processor', '32 Bit ARM CPU'],
      ['Memory', 'SDRAM: 128 Mb, Flash: 64 Mb (32 Mb for user)'],
      ['1D Barcodes', 'Code 39, Code 93, EAN 8/13, UPC A/E, Interleaved 2of5, Codabar, Code 128, EAN/UCC 128, ITF 14, GS1 DataBar'],
      ['2D Barcodes', 'PDF417, QR code, Micro PDF417, Micro QR code'],
      ['Interfaces', 'USB 2.0, Ethernet 10/100 Mbps'],
      ['Dimensions', '270 mm x 170 mm x 240 mm'],
      ['Weight', '3.7 Kg (excluding consumables)'],
      ['Available Accessories', 'Label Dispenser, Label Holder, Label Rewinder, WiFi Module, Bluetooth Module, RFID Module'],
    ]),
  },
  {
    name: 'HRD13 RFID HF Mifare Reader',
    model: 'HRD13',
    sku: 'VST-HRD13',
    category: 'HF Reader',
    description: description(
      'The Virtualsphere HRD13 is a driver-free, 13.56MHz HF RFID reader in a compact desktop USB enclosure, offering read distances up to 80mm along with stable, reliable data capture. Its simple plug-and-play design makes it easy to deploy across automated parking management, personal identification, access control, and production-line access systems.',
      [
        'Driver-free USB plug-and-play — works instantly with Notepad, Word, Excel, or any text field',
        'Read distance up to 80mm for fast, reliable tag capture',
        'Compact desktop enclosure form factor',
        'Dual-color LED with buzzer feedback for clear read status',
        'Broad OS support: Windows XP/CE/7/10, Linux, Vista, and Android',
        'Customizable output format to fit existing software workflows',
      ]
    ),
    specifications: specs([
      ['Frequency', '13.56MHz'],
      ['Support Cards', 'MF (S50/S70/NTAG203 etc, 14443A protocol cards)'],
      ['Output Format', '10-digit Dec (default), customizable'],
      ['Size', '104mm x 68mm x 10mm'],
      ['Colour', 'Black'],
      ['Interface', 'USB'],
      ['Power Supply', 'DC-5V'],
      ['Operating Distance', '0mm-100mm'],
      ['Read Time', '<200ms'],
      ['Weight', '140g'],
      ['Material', 'ABS'],
      ['Operating System', 'Win XP/CE/7/10, Linux, Vista, Android'],
      ['Protection Rating', 'IP65'],
      ['Cable Length', '1400mm'],
    ]),
  },
  {
    name: 'HRP70 RFID HF Pendrive Reader',
    model: 'HRP70',
    sku: 'VST-HRP70',
    category: 'HF Reader',
    description: description(
      'The Virtualsphere HRP70 is a driver-free, 13.56MHz HF RFID reader in a compact USB pendrive form factor, offering read distances up to 80mm along with stable, reliable data capture. Its simple plug-and-play design makes it easy to deploy across automated parking management, personal identification, access control, and production-line access systems.',
      [
        'Driver-free USB plug-and-play — works instantly with Notepad, Word, Excel, or any text field',
        'Read distance up to 80mm for fast, reliable tag capture',
        'Compact pendrive form factor: 75mm x 21mm x 7mm',
        'Dual-color LED with buzzer feedback for clear read status',
        'Broad OS support: Windows XP/CE/7/10, Linux, Vista, and Android',
        'Customizable output format to fit existing software workflows',
      ]
    ),
    specifications: specs([
      ['Frequency', '13.56MHz'],
      ['Support Cards', 'MF (S50/S70/NTAG203 etc, 14443A protocol cards)'],
      ['Output Format', '10-digit Dec (default), customizable'],
      ['Size', '75mm x 21mm x 7mm'],
      ['Colour', 'White'],
      ['Interface', 'USB'],
      ['Power Supply', 'DC-5V'],
      ['Operating Distance', '0mm-100mm'],
      ['Read Time', '<200ms'],
      ['Weight', '10g (without package), 40g (with package)'],
      ['Material', 'ABS'],
      ['Operating System', 'Win XP/CE/7/10, Linux, Vista, Android'],
      ['Protection Rating', 'IP65'],
    ]),
  },
  {
    name: 'LRP70 RFID LF Pendrive Reader',
    model: 'LRP70',
    sku: 'VST-LRP70',
    category: 'LF Reader',
    description: description(
      'The Virtualsphere LRP70 is a driver-free, 125KHz LF RFID reader in a compact USB pendrive form factor, offering read distances up to 80mm along with stable, reliable data capture. Its simple plug-and-play design makes it easy to deploy across automated parking management, personal identification, access control, and production-line access systems.',
      [
        'Driver-free USB plug-and-play — works instantly with Notepad, Word, Excel, or any text field',
        'Read distance up to 80mm for fast, reliable tag capture',
        'Compact pendrive form factor: 75mm x 21mm x 7mm',
        'Dual-color LED with buzzer feedback for clear read status',
        'Broad OS support: Windows XP/CE/7/10, Linux, Vista, and Android',
        'Customizable output format to fit existing software workflows',
      ]
    ),
    specifications: specs([
      ['Frequency', '125KHz'],
      ['Support Cards', 'EM4100, TK4100, SMC4001'],
      ['Output Format', '10-digit Dec (default), customizable'],
      ['Size', '75mm x 21mm x 7mm'],
      ['Colour', 'White'],
      ['Interface', 'USB'],
      ['Power Supply', 'DC-5V'],
      ['Operating Distance', '0mm-100mm'],
      ['Read Time', '<200ms'],
      ['Weight', '10g (without package), 40g (with package)'],
      ['Material', 'ABS'],
      ['Operating System', 'Win XP/CE/7/10, Linux, Vista, Android'],
      ['Protection Rating', 'IP65'],
    ]),
  },
  {
    name: 'PBR3 RFID UHF Bluetooth Handheld Reader',
    model: 'PBR3',
    sku: 'VST-PBR3',
    category: 'RFID Handheld Reader',
    description: description(
      'The Virtualsphere PBR3 is a compact, Bluetooth-enabled UHF RFID reader designed for on-the-go inventory and asset operations. Fully compliant with ISO18000-6C and EPC Class 1 Gen2 standards, it pairs seamlessly with Android (4.3+) and iOS smartphones and tablets over Bluetooth, letting users control read operations and stream captured tag data straight to their mobile device for immediate processing.',
      [
        'Fully conforms to ISO18000-6C and EPC Class 1 Gen2 standards for broad tag compatibility',
        'Bluetooth pairing with Android (4.3+) and iOS smartphones/tablets — no cables needed',
        'Operate scanning directly from your phone or tablet via companion app',
        'Captured tag data streams instantly to your mobile device for on-the-spot processing',
        '3000mAh non-removable battery with >4 hours standby time',
        'Ideal for traceability systems, anti-counterfeiting programs, and equipment/asset management',
      ]
    ),
    specifications: specs([
      ['Air Protocols', 'EPC Class 1 Gen 2 (ISO 18000-6C)'],
      ['Chipset', 'MagicRF QM100'],
      ['Frequency', 'USA: 902-928MHz FCC; Other: 840-960MHz customizable'],
      ['RF Output Power', '5dBm-30dBm'],
      ['Connectivity', 'Bluetooth 4.0 (BLE)'],
      ['Reading Distance', '>4m'],
      ['Anti-collision', '>50 tags/s'],
      ['Dimension', '130mm x 65mm x 16mm'],
      ['Housing Material', 'ABS Plastic'],
      ['Battery', '3.7V/3000 mAh Rechargeable Lithium Polymer (non-replaceable)'],
      ['Charging', 'Type C, ~5.5 hrs'],
      ['Continuous Working Time', '8hrs (Active mode, 27dBm)'],
      ['SDK', 'C, C#/.NET, Java'],
    ]),
  },
  {
    name: 'VST SIL 5015 RFID Silicon Tag',
    model: 'VST SIL 5015',
    sku: 'VST-SIL5015',
    category: 'RFID Tags',
    description: description(
      'Virtualsphere provides a highly reliable and versatile RFID Silicon Tag, specifically designed for retail, logistics, and healthcare applications. Constructed with a robust, durable silicon encasement that withstands harsh environments, the tag is equipped with an advanced RFID chip providing high read range and fast data transmission — a reliable, high-performance, and cost-effective solution for a wide range of applications.',
      [
        'UHF, IP68-rated, washable up to 100 wash cycles',
        'Compact size and flexible form factor',
        'Compatible with a wide range of RFID readers and chip types',
        'Resistant to chemical solvents and moisture',
        'Withstands industrial washing, ironing, and sterilization cycles',
        'Customer-specific EPC encoding and printed personalization available',
      ]
    ),
    specifications: specs([
      ['Dimensions', '50mm x 15mm x 2mm'],
      ['Weight', '8 gm ± 1'],
      ['Encasement / Material', 'Silicon'],
      ['Sealing', 'IP68'],
      ['Working Frequency', '860-960 MHz (ETSI), 902-928 MHz (FCC)'],
      ['Standard Protocol', 'EPC Class 1 Gen2 (ISO18000-6C)'],
      ['Chip Type', 'Alien Higgs-3/4, Monza 4/4QT/5/R6/R6P, UCODE 7/8'],
      ['Read Range (Fixed Reader)', 'Up to 6m'],
      ['Read Range (Handheld Reader)', 'Up to 3m'],
      ['Lifetime', 'Up to 100 washes'],
      ['Shock & Vibration', 'MIL STD 810-G'],
      ['Storage Temperature', '-40°C to +85°C'],
      ['Operating Temperature', 'Washing: 90°C/15min/200 cycles; Ironer: 180°C/10s/200 cycles; Sterilization: 135°C/20min'],
    ]),
  },
  {
    name: 'ACR122U USB NFC Reader',
    model: 'ACR122U',
    sku: 'ACS-ACR122U',
    category: 'NFC/HF Reader & Writer',
    description: description(
      'The ACR122U (Advanced Card Systems) is a PC-linked contactless smart card reader/writer built on 13.56 MHz contactless technology — the world\'s first CCID-compliant contactless reader/writer that follows both ISO 14443 and ISO 18092. It supports MIFARE, ISO 14443 Type A/B cards, FeliCa, and NFC tags, and is PC/SC-compliant for interoperability across applications and platforms.',
      [
        'USB Full Speed interface, CCID-compliant',
        'Read/write speed up to 424 Kbps for NFC tag access',
        'Built-in antenna, card reading distance up to 50mm',
        'Supports ISO 14443 Type A & B, MIFARE Classic, FeliCa, and NFC tags',
        'Built-in anti-collision, user-controllable bi-color LED and buzzer',
        'Supports PC/SC, CT-API, and Android 3.1+',
      ]
    ),
    specifications: specs([
      ['Dimensions', '98.0 mm (L) x 65.0 mm (W) x 12.8 mm (H)'],
      ['Weight', '70 g'],
      ['USB Protocol', 'USB CCID, Full Speed (12 Mbps)'],
      ['Standard', 'ISO/IEC 18092 NFC, ISO 14443 Type A & B, MIFARE, FeliCa'],
      ['Operating Frequency', '13.56 MHz'],
      ['Operating Distance', 'Up to 50 mm (tag dependent)'],
      ['Read/Write Speed', '106 / 212 / 424 Kbps'],
      ['API', 'PC/SC, CT-API'],
      ['OS Support', 'Windows, Linux, Mac OS, Solaris, Android 3.1+'],
      ['Certifications', 'CE, FCC, RoHS 2, REACH, VCCI, KC, Microsoft WHQL'],
    ]),
  },
  {
    name: 'UA9 RFID UHF 9dBi Antenna',
    model: 'UA9',
    sku: 'VST-UA9',
    category: 'RFID UHF Antenna',
    description: description(
      'The Virtualsphere UA9 is a 9dBi circular polarized UHF antenna covering 835–945MHz, purpose-built for fixed RFID reader installations that need consistent, long-range tag capture. Housed in a weatherproof PC+ABS radome rated IP67 and built to operate from -40°C to 55°C, the UA9 is designed for outdoor gates, dock doors, warehouse portals, and other demanding fixed-infrastructure deployments.',
      [
        '9dBi gain with circular polarization for reliable tag orientation tolerance',
        'Wide 835–945MHz frequency coverage suits multiple regional UHF bands',
        'Low VSWR (≤1.8) and tight axial ratio (≤3dB) for clean, efficient signal transfer',
        'IP67-rated weatherproof housing for outdoor and industrial environments',
        'Rugged aluminium reflector with 50W power handling',
        'Simple pole/wall mounting with rear N-Female connector',
      ]
    ),
    specifications: specs([
      ['Frequency', '902~928MHz (US/FCC), 865~868MHz (EU/ETSI)'],
      ['Gain', '9dBi'],
      ['Beam Width', 'Horizontal: 65° | Vertical: 65°'],
      ['VSWR', '≤1.8'],
      ['Impedance', '50 Ω'],
      ['Polarization', 'Circular'],
      ['Axial Ratio', '≤3 dB'],
      ['Max Power', '50W'],
      ['Connector', 'N Female (rear mounted)'],
      ['Dimension', '260 x 260 x 40 mm'],
      ['Weight', '0.85 kg'],
      ['Reflector Material', 'Aluminium'],
      ['Radome Material', 'PC + ABS'],
      ['Protection Rating', 'IP67'],
      ['Operating Temperature', '-40°C to 55°C'],
    ]),
  },
  {
    name: 'UCA3 RFID UHF Ceramic Antenna',
    model: 'UCA3',
    sku: 'VST-UCA3',
    category: 'RFID UHF Antenna',
    description: description(
      'The UCA3 UHF patch antenna is suitable for the UHF band in the RFID industry. Adopting a ceramic design, it features high gain, low loss, low standing wave ratio, and stable performance. Thanks to the ceramic manufacturing process, the antenna is much thinner than conventional ones, with an elegant appearance and easy installation — widely applicable in warehousing, logistics, asset management, access control, and smart cabinets.',
      [
        'Ceramic construction — thinner profile than conventional patch antennas',
        'High gain, low loss, low VSWR',
        'Compatible with a wide range of domestic and international readers',
        'Compact 40x40mm ceramic element on a 50x50mm PCB, 6mm total thickness',
        'Customization available on request',
      ]
    ),
    specifications: specs([
      ['Frequency', '902~928MHz (US/FCC), 865~868MHz (EU/ETSI)'],
      ['Gain', '3dBi'],
      ['Beam Width', 'Horizontal: 40° | Vertical: 28°'],
      ['VSWR', '≤1.5'],
      ['Impedance', '50 Ω'],
      ['Polarization', 'Circular'],
      ['Axial Ratio', '≤3 dB'],
      ['Max Power', '50W'],
      ['Connector', 'MMCX or SMA Male, SMA Female'],
      ['Dimension', 'Ceramic 40x40mm, PCB 50x50mm, total thickness 6mm'],
      ['Weight', '37.8g'],
      ['Reflector Material', 'Ceramic, FR4'],
      ['Protection Rating', 'IP65'],
      ['Operating Temperature', '-25°C to +75°C'],
    ]),
  },
  {
    name: 'UDM9R RFID UHF Integrated Reader',
    model: 'UDM9R',
    sku: 'VST-UDM9R',
    category: 'RFID UHF Reader / INTEGRATED Reader',
    description: description(
      'Virtualsphere UDM9R is a high-performance single-channel fixed RFID reader. It employs a self-developed high-performance module based on the Impinj E310 chip, working together with an integrated high-performance antenna, and supports Impinj Gen2X. UDM9R is applicable widely in warehousing, archives management, library management, banking, and production line management.',
      [
        'High-performance with Impinj E310 chip',
        'Integrated high-performance antenna',
        'Supports Impinj Gen2X (EPC Gen2) protocol',
        'Multiple communication interfaces (RS-232, RJ45, GPIO, TCP/IP, Wiegand)',
        'Compact, durable and IP68 rated',
        'Up to 15m reading range',
      ]
    ),
    specifications: specs([
      ['Reading Range', 'Up to 15 m'],
      ['RF Output Power', '30 dBm'],
      ['Interface', 'RS-232, RJ45, GPIO, TCP/IP, Wiegand, POE'],
      ['Antenna Ports', '1 port (internal antenna)'],
      ['Tag Protocol', 'EPC Gen2'],
      ['Chip', 'Impinj E310'],
      ['Ingress Rating', 'IP68'],
      ['Operating Voltage', '12 V DC'],
      ['Dimension', '270 x 270 x 77 mm'],
      ['Housing Material', 'ABS'],
      ['Baud Rate', '115200 bps'],
      ['Gain', '9 dBi'],
      ['Working Frequency', '870 MHz'],
      ['SDK', 'C#, Java'],
      ['Warranty', '1 year standard'],
    ]),
  },
  {
    name: 'UDR-W101 RFID UHF Desktop Reader',
    model: 'UDR-W101',
    sku: 'VST-UDRW101',
    category: 'RFID UHF Desktop Reader',
    description: description(
      'Virtualsphere UDR-W101 is a high-performance single-channel fixed RFID reader with a USB interface, offering read/write functionality for Point of Sales, Registration, and Inventory Management across Windows, iOS, Android, and Linux. It defaults to USB keyboard emulator mode for plug-and-play use, with a configuration tool to switch to reader mode and customize frequency range, data output format, and tag writing.',
      [
        'Compact, high-performance single-channel design',
        'USB interface for quick, plug-and-play connectivity',
        'Full read/write functionality for tag data',
        'Ideal for Point of Sales, Registration & Inventory Management',
        'Precise power adjustment from 0 to 26dBm',
      ]
    ),
    specifications: specs([
      ['Dimension', '70mm x 112mm x 23mm'],
      ['Comm Interface', 'USB-Keyboard Emulator'],
      ['Colour', 'Black'],
      ['Housing Material', 'ABS'],
      ['Baud Rate', '115200 bps'],
      ['Working Frequency', 'TW 922–928 MHz / EU 865–868 MHz'],
      ['Protocol', 'EPC C1G2 ISO 18000-6C'],
      ['SDK Support', 'Windows'],
      ['Read Range', 'Up to 8 m'],
      ['Output Power', '3 dBm to 30 dBm'],
    ]),
  },
  {
    name: 'UDR-W105 RFID UHF Desktop Reader',
    model: 'UDR-W105',
    sku: 'VST-UDRW105',
    category: 'RFID UHF Desktop Reader',
    description: description(
      'The UDR-W105 is a desktop reader for tag data programming, with excellent protection and read/write performance, optimized for automatic batch tag data writing and single write operations. Complementary software supports quick Excel import/export for rapid, intelligent, automated data entry. USB connectivity and virtual keyboard input support a variety of complex applications.',
      [
        'Classic industrial form factor with a simple, atmospheric design',
        'Simple operation via USB connectivity & virtual keyboard support',
        'Reliable performance with integrated antenna for near-field application & minimum misread',
        'Robust tag data operation with automatic data handling and DEMO software',
        'SDKs supporting C#, Android & Java',
        'Direct data encryption for tag operation security',
      ]
    ),
    specifications: specs([
      ['Dimensions', '150mm x 110mm x 19mm'],
      ['Weight', '0.5 kg'],
      ['IP Rating', 'IP32'],
      ['Frequency', '840–960 MHz'],
      ['SDK', 'Yes — C#, Android & Java'],
      ['Encryption', 'Yes'],
      ['Output Power', '0–30 dBm (24 dBm typical)'],
      ['Read Distance', '0–60 cm (configuration dependent)'],
      ['Write Distance', '0–60 cm (configuration dependent)'],
      ['Com Port', 'Type-C'],
      ['Power Supply', 'USB'],
    ]),
  },
  {
    name: 'UDR102 RFID UHF Desktop Reader',
    model: 'UDR102',
    sku: 'VST-UDR102',
    category: 'RFID UHF Desktop Reader',
    description: description(
      'Virtualsphere UDR102 is a high-performance single-channel fixed RFID reader with a serial interface, offering read/write functionality for Point of Sales, Registration, and Inventory Management across Windows, iOS, Android, and Linux. Built with the Impinj E310 chip, it supports ISO18000-6C (EPC C1G2) with a tag buffer of up to 1000 pieces at 96-bit EPC.',
      [
        'Self-intellectual property, designed with Impinj E310 chip',
        'Supports RSSI, tag buffer size up to 1000pcs @ 96-bit EPC',
        'Built-in 3dBi PCB ceramic antenna',
        'Low power dissipation',
        'DLL and demonstration software source code provided for development',
      ]
    ),
    specifications: specs([
      ['Dimension', '310mm x 230mm x 60mm'],
      ['Comm Interface', 'RS232'],
      ['Operating Mode', 'Answer, Active'],
      ['Baud Rate', '115200 bps'],
      ['Working Frequency', '865–868 MHz (customizable)'],
      ['Engine', 'VM310-1 based on Impinj E310 chip'],
      ['Protocol', 'EPC Global UHF ISO-18000-6C (EPC G2), ISO-18000-6B'],
      ['API Support', 'Windows, Linux'],
      ['Read Range', 'Up to 3–5 metres'],
      ['Output Power', '0–33 dBm, adjustable'],
    ]),
  },
  {
    name: 'UDT9R RFID Smart Tray Reader',
    model: 'UDT9R',
    sku: 'VST-UDT9R',
    category: 'RFID UHF Reader',
    description: description(
      'Virtualsphere Technologies RFID Smart Tray is a sleek and modern solution designed exclusively for jewellery showrooms and shops. It combines advanced RFID technology with premium materials to ensure style, security and performance, with a patented design that reads only the tags placed on the tray — stray tags outside the tray are not read.',
      [
        'Beautiful aluminium finish, soft velvet material to avoid scratches on jewellery',
        'Inbuilt rechargeable battery with working time up to 6 hours',
        'Adjustable RF output power',
        'Bluetooth enabled — connects to phone or tablet, Android supported',
        'Waterproof LED and power buttons for long-lasting durability',
        'Patented design reads only tags on the tray, ignoring stray tags',
      ]
    ),
    specifications: specs([
      ['Interface', 'Bluetooth'],
      ['Supported', 'Android'],
      ['Body Material', 'Aluminium'],
      ['Feature', 'Waterproof'],
      ['Surface Finish', 'Aluminium finish'],
      ['Battery', 'Inbuilt rechargeable, 6 hours working time'],
      ['Charging Port', 'Type-C'],
      ['Indication', 'LED'],
    ]),
  },
  {
    name: 'UHR2 RFID UHF Handheld Reader',
    model: 'UHR2',
    sku: 'VST-UHR2',
    category: 'RFID Handheld Reader',
    description: description(
      'The Virtualsphere UHR2 is an Android 13 handheld UHF RFID reader delivering >33dBm transmit power, 20m read range, and 500+ tags/second — even in dense-tag environments. With integrated 1D/2D barcode scanning, NFC, a 13MP camera, and a rugged 4000mAh (8000mAh-equivalent) design, it is built for warehouse, retail, asset tracking, and industrial field operations.',
      [
        'High-power UHF module: >33dBm transmit power, <-86dBm receive sensitivity',
        'Long read range up to 20 meters with >500 tags/second multi-tag reading',
        'Android 13.0, octa-core CPU, 4GB+64GB memory, expandable to 256GB',
        'Integrated 1D/2D barcode scanning, 13.56MHz NFC, 13MP camera',
        'Removable battery with >350 hours standby time',
        'IP65-rated, rugged design withstands 1.2m drops and continuous tumble testing',
      ]
    ),
    specifications: specs([
      ['CPU', 'MT6762 Octa-Core 64bit 2.0 GHz'],
      ['RAM+ROM', '4GB + 64GB (expandable to 256GB)'],
      ['Operating System', 'Android 10.0 / Android 13.0'],
      ['Antenna', 'Circular Polarization, 4.65 dBi'],
      ['RF Air Interface', 'ISO 18000-6C/6B, EPC C1G2'],
      ['Read Speed', '>500 tags/second (circular polarization)'],
      ['Read/Write Range', '0-20 m (configuration dependent)'],
      ['2D Scanning', 'N6602-W2 engine'],
      ['Camera', 'Rear 13MP, Front 2MP'],
      ['Display', '5.5", 720x1440'],
      ['Battery', 'Polymer 7.6V 4000mAh (~8000mAh equivalent), removable, >350h standby'],
      ['NFC', '13.56MHz, ISO14443A/B & 15693, 2-5cm range'],
      ['Bluetooth', '5.0 + BLE'],
      ['Overall Size', '179mm x 74.5mm x 150mm (with handle)'],
      ['Weight', '<750g'],
      ['Protection Rating', 'IP65'],
    ]),
  },
  {
    name: 'VSL-A1 RFID Fixed Reader',
    model: 'VSL-A1',
    sku: 'VST-VSLA1',
    category: '4-Port Reader',
    description: description(
      'Virtualsphere VSL-A1 is a high-performance fixed RFID reader running Android 11 on a 2.0GHz quad-core CPU. Equipped with the Impinj E710 chip and supporting Impinj Gen2X, it delivers strong UHF performance with RS232, RJ45, HDMI and other interfaces, supporting DC, POE, and POE+ power. Suited for warehousing, file management, library management, production line management, medical device cabinets, and unmanned retail.',
      [
        'Android 11 with 2.0GHz quad-core CPU',
        'Impinj E710 chip with Impinj Gen2X support',
        'Supports a variety of antennas (6dBic, 9dBic), 4/8 channel RP-TNC ports',
        'RS-232, RJ45, USB Host/Device interfaces',
        'DC, POE, and POE+ power supply support',
      ]
    ),
    specifications: specs([
      ['Frequency Range', '865-868 MHz / 920-925 MHz / 902-928 MHz'],
      ['Protocol', 'EPC Global UHF Class 1 Gen 2 / ISO 18000-6C'],
      ['Antenna', '6dBic/9dBic, 4/8 channel 50Ω RP-TNC port'],
      ['CPU', 'Octa-core 2.0 GHz'],
      ['RAM+ROM', '2GB + 16GB'],
      ['Ethernet Interface', '10/100 Base-T (RJ45)'],
      ['Baud Rate', '115200 bps'],
      ['Bluetooth', 'Bluetooth 4.0'],
      ['Engine', 'Module based on Impinj E710'],
      ['Comm Interface', '1x RS-232, 1x RJ45, 1x USB Host, 1x USB Device'],
      ['Operating System', 'Android 11'],
    ]),
  },
  {
    name: 'VSL-A4 RFID Fixed Reader',
    model: 'VSL-A4',
    sku: 'VST-VSLA4',
    category: '4-Port Reader',
    description: description(
      'Virtualsphere VSL-A4 is a 4-channel fixed RFID reader based on Android 13, integrated with the Impinj E710 chip. With Impinj Gen2X support, it delivers superior UHF performance. The reader supports RS232, RJ45 and HDMI and is compatible with various antenna types — ideally applied to warehouse management, archives and library management, banking, clothing and footwear retail, jewelry monitoring, laundry, production line management, medical instrument cabinets and vending machines.',
      [
        '4-channel fixed reader on Android 13',
        'Impinj E710 chip with Impinj Gen2X support',
        'Compatible with a variety of antennas (6dBic, 9dBic), 4 channel TNC port',
        'RS232, RJ45, multiple USB2.0 Type A + Type C interfaces',
        'High stability for continuous retail and industrial deployments',
      ]
    ),
    specifications: specs([
      ['Frequency Range', '865-868 MHz / 920-925 MHz / 902-928 MHz'],
      ['Protocol', 'EPC Global UHF Class 1 Gen 2 / ISO 18000-6C'],
      ['Antenna', '6dBic/9dBic, 4 channel 50Ω TNC port'],
      ['CPU', 'Octa-core 2.0 GHz'],
      ['RAM+ROM', '3GB + 32GB'],
      ['Ethernet Interface', '10/100 Base-T (RJ45)'],
      ['Baud Rate', '115200 bps'],
      ['Bluetooth', 'Bluetooth 2.1+EDR / 3.0 / 4.1 LE / 4.2 BLE / 5.0 LE'],
      ['Engine', 'CM710-4 module based on Impinj E710'],
      ['Comm Interface', '1x RS-232, 1x RJ45, 3x USB2.0 Type A, 1x Type C'],
      ['Operating System', 'Android 13'],
    ]),
  },
  {
    name: 'VST TEX 7015 RFID Textile Tag',
    model: 'VST TEX 7015',
    sku: 'VST-TEX7015',
    category: 'RFID Tags',
    description: description(
      "Virtualsphere's RFID Textile Sew-In Fabric Tag is a versatile and innovative solution for laundry applications. This tag can be easily integrated into any type of textile material, including clothes, bed linens, and towels. The RFID technology allows for accurate and real-time tracking of laundry items, making it easier to manage inventory and ensure proper washing and drying processes.",
      [
        'UHF, IP68-rated, washable up to 200 wash cycles',
        'Sew-in or heat-sealed attachment for textiles',
        'Durable construction built for harsh laundry environments',
        'Resistant to chemical solvents and moisture',
        'Customer-specific EPC encoding and printed personalization available',
      ]
    ),
    specifications: specs([
      ['Dimensions', '70mm x 15mm'],
      ['Weight', '8 gm ± 1'],
      ['Encasement / Material', 'Textile'],
      ['Sealing', 'IP68'],
      ['Attachment', 'Heat sealing, sewing'],
      ['Working Frequency', '860-960 MHz (ETSI), 902-928 MHz (FCC)'],
      ['Standard Protocol', 'EPC Class 1 Gen2 (ISO18000-6C)'],
      ['Chip Type', 'Alien Higgs-3/4, Monza 4/4QT/5/R6/R6P, UCODE 7/8'],
      ['Read Range (Fixed Reader)', 'Up to 6m'],
      ['Read Range (Handheld Reader)', 'Up to 4m'],
      ['Lifetime', 'Up to 200 washes'],
      ['Storage Temperature', '-40°C to +85°C'],
    ]),
  },
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function api(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `${res.status} ${res.statusText}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

async function main() {
  const missingPrices = Object.entries(PRICES)
    .filter(([, price]) => price === null || price === undefined)
    .map(([sku]) => sku);
  if (missingPrices.length > 0) {
    console.error('Missing prices for:', missingPrices.join(', '));
    console.error('Fill in the PRICES table at the top of this script before running.');
    process.exit(1);
  }
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD env vars (an existing admin user).');
    process.exit(1);
  }

  console.log(`Logging in to ${API_URL} as ${ADMIN_EMAIL}...`);
  const login = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (login.role !== 'admin') {
    console.error(`User ${ADMIN_EMAIL} has role "${login.role}", not "admin". Aborting.`);
    process.exit(1);
  }
  const token = login.token;
  const authHeaders = { Authorization: `Bearer ${token}` };

  console.log('Fetching existing categories...');
  const existingCategories = await api('/categories');
  const categoryIdByName = new Map(existingCategories.map((c) => [c.name, c._id]));

  for (const name of CATEGORIES) {
    if (categoryIdByName.has(name)) {
      console.log(`Category exists: ${name}`);
      continue;
    }
    console.log(`Creating category: ${name}`);
    const created = await api('/categories', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name }),
    });
    categoryIdByName.set(name, created._id);
  }

  console.log('Fetching existing products...');
  const productsResponse = await api('/products?limit=1000');
  const existingProducts = Array.isArray(productsResponse) ? productsResponse : productsResponse.products || [];
  const existingSkus = new Set(existingProducts.map((p) => p.sku));

  for (const product of PRODUCTS) {
    if (existingSkus.has(product.sku)) {
      console.log(`Product exists, skipping: ${product.sku} — ${product.name}`);
      continue;
    }
    const categoryId = categoryIdByName.get(product.category);
    if (!categoryId) {
      console.error(`No category ID found for "${product.category}" (product ${product.sku}) — skipping.`);
      continue;
    }
    console.log(`Creating product: ${product.sku} — ${product.name}`);
    await api('/products', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: product.name,
        description: product.description,
        model: product.model,
        sku: product.sku,
        price: PRICES[product.sku],
        stock: 100,
        status: true,
        category: categoryId,
        specifications: product.specifications,
        images: [],
        slug: slugify(product.name),
      }),
    });
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error('Import failed:', err.message);
  process.exit(1);
});
