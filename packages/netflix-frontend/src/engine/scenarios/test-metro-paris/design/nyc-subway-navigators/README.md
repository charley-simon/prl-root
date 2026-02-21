# 🚇 NYC Subway Navigators

**Two vintage-styled subway route finders for New York City**

## 📦 Contents

```
nyc-subway-navigators/
├── pili-1937/           # Art Déco style (1937 PILI terminals)
├── steampunk/           # Victorian Steampunk style
└── README.md            # This file
```

---

## 🚀 Quick Start

### Option 1: PILI 1937 (Art Déco)

```bash
cd pili-1937
# Open index.html in your browser
open index.html  # macOS
start index.html # Windows
```

### Option 2: Steampunk

```bash
cd steampunk
# Open index.html in your browser
open index.html  # macOS
start index.html # Windows
```

---

## 🎨 What's the difference?

### PILI 1937
- **Era:** 1937 Paris PILI terminals
- **Style:** Art Déco
- **Materials:** Bakelite, chrome, phosphor displays
- **Lights:** Tungsten incandescent bulbs
- **Aesthetic:** Functional, historical, authentic

### Steampunk
- **Era:** Victorian meets future
- **Style:** Jules Verne / Tesla
- **Materials:** Copper, brass, gears
- **Lights:** Edison bulbs, Tesla arcs
- **Aesthetic:** Ornate, fantastical, imaginative

---

## 🎮 How to use

1. **Click a departure station** on the map
   - Station lights up
   - Connected stations illuminate
   
2. **Click a destination station**
   - Path calculation begins
   - Stations light up in sequence
   - Route details appear in control panel

3. **Reset** to try another route

---

## 📊 Sample data

Both versions include:
- 30 NYC subway stations (sample)
- 3 subway lines (1, 4, 7)
- Realistic travel times
- Transfer connections

**Note:** This is demo data for illustration. For full NYC subway data:
- Download GTFS from https://new.mta.info/developers
- Use the data generation scripts (coming soon)

---

## 🔧 Technical Details

**Built with:**
- Pure JavaScript (no frameworks)
- Canvas 2D for rendering
- LinkLab graph engine (pathfinding)
- CSS3 animations

**Browser compatibility:**
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅

---

## 📝 Files structure

```
pili-1937/
├── index.html           # Main page
├── app.js               # JavaScript logic
├── data/
│   ├── stations.json    # Station coordinates
│   ├── lines.json       # Subway lines
│   └── graph.json       # LinkLab graph
└── README.md

steampunk/
├── index.html
├── app.js
├── data/
│   ├── stations.json
│   ├── lines.json
│   └── graph.json
└── README.md
```

---

## 🎯 Next Steps

1. **Add real data:** Use full MTA GTFS dataset
2. **Add sounds:** Relay clicks, buzzes, bells
3. **Add animations:** More elaborate light sequences
4. **Mobile responsive:** Touch controls
5. **Save routes:** Local storage for favorites

---

## 💡 Inspiration

**PILI 1937:**
- Original 1937 Paris PILI terminals
- Art Déco metropolitan design
- Electromechanical computing

**Steampunk:**
- Jules Verne novels
- Nikola Tesla experiments
- Victorian industrial design

---

## 📜 License

MIT License - Do whatever you want with it!

---

**Enjoy your journey through time and transit!** 🚇✨
