/**
 * Imports the products from the datasheets in c:\DEVELOPMENT\rfid\products\*.pdf
 * that are NOT already present in the production backend, using production's
 * existing (nested) category taxonomy. The 6 that already exist there
 * (UDR102, UDM9R, VSL-A1, silicon tag, textile tag, ACR122U) are skipped.
 *
 * Run (values passed via env vars, none hardcoded here):
 *   API_URL=<production API URL> ADMIN_EMAIL=<admin email> ADMIN_PASSWORD=<password> node scripts/importMissingToProd.js
 *
 * Idempotent by SKU -- safe to re-run.
 */

const API_URL = process.env.API_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const PRICES = {
  'VST-UDM9A': 15000,
  'VST-DBP01': 12000,
  'VST-HRD13': 1200,
  'VST-HRP70': 1500,
  'VST-LRP70': 1500,
  'VST-PBR3': 8500,
  'VST-UA9': 7000,
  'VST-UCA3': 1500,
  'VST-UDRW101': 6000,
  'VST-UDRW105': 7000,
  'VST-UDT9R': 22000,
  'VST-UHR2': 48000,
  'VST-VSLA4': 42000,
};

const EXISTING_CATEGORY_NAMES = [
  'RFID Integrated Reader',
  'RFID HF Reader',
  'RFID LF Readers',
  'RFID Handheld Reader',
  'RFID Antenna',
  'RFID UHF Desktop Reader',
  'RFID Multi Port Reader',
  'RFID Readers',
];

const NEW_CATEGORIES = [
  { name: 'Barcode Printers', parent: null },
  { name: 'RFID Smart Trays', parent: 'RFID Readers' },
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
    category: 'RFID Integrated Reader',
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
    category: 'RFID HF Reader',
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
    category: 'RFID HF Reader',
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
    category: 'RFID LF Readers',
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
    name: 'UA9 RFID UHF 9dBi Antenna',
    model: 'UA9',
    sku: 'VST-UA9',
    category: 'RFID Antenna',
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
    category: 'RFID Antenna',
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
    name: 'UDT9R RFID Smart Tray Reader',
    model: 'UDT9R',
    sku: 'VST-UDT9R',
    category: 'RFID Smart Trays',
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
    name: 'VSL-A4 RFID Fixed Reader',
    model: 'VSL-A4',
    sku: 'VST-VSLA4',
    category: 'RFID Multi Port Reader',
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
  if (!API_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Set API_URL, ADMIN_EMAIL, and ADMIN_PASSWORD env vars.');
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
  const authHeaders = { Authorization: `Bearer ${login.token}` };

  console.log('Fetching existing categories...');
  const existingCategories = await api('/categories');
  const categoryIdByName = new Map(existingCategories.map((c) => [c.name, c._id]));

  for (const name of EXISTING_CATEGORY_NAMES) {
    if (!categoryIdByName.has(name)) {
      console.error(`Expected category "${name}" not found in production — aborting to avoid creating a duplicate with a different structure.`);
      process.exit(1);
    }
  }

  for (const { name, parent } of NEW_CATEGORIES) {
    if (categoryIdByName.has(name)) {
      console.log(`Category exists: ${name}`);
      continue;
    }
    const parentId = parent ? categoryIdByName.get(parent) : undefined;
    console.log(`Creating category: ${name}${parent ? ` (parent: ${parent})` : ''}`);
    const created = await api('/categories', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name, parent: parentId }),
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
