const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const nextBtn = document.getElementById('next-btn');
const furnace = document.getElementById('furnace');
const explanationCard = document.getElementById('explanation-card');
const stepTitle = document.getElementById('step-title');
const stepDescription = document.getElementById('step-description');
const chemicalEquation = document.getElementById('chemical-equation');

let hotAirContainer, moltenIronLayer, ironFlow;

const steps = [
    {
        title: "1단계: 원료 투입",
        description: "용광로 위쪽으로 철광석(산화철)과 코크스(탄소)를 넣습니다. 이 원료들은 서서히 아래로 내려갑니다.",
        equation: "Fe₂O₃, C ↓"
    },
    {
        title: "2단계: 코크스의 연소",
        description: "뜨거운 공기가 코크스를 연소시켜 일산화탄소(CO)를 생성합니다. 생성된 일산화탄소는 위쪽으로 올라갑니다.",
        equation: "C + O₂ → CO₂ → 2CO"
    },
    {
        title: "3단계: 철광석의 환원",
        description: "일산화탄소가 철광석의 산소를 빼앗아 이산화탄소로 변합니다. 산소를 모두 잃은 철광석은 순수한 철(Fe)이 됩니다.",
        equation: "Fe₂O₃ + 3CO → 2Fe + 3CO₂"
    },
    {
        title: "4단계: 쇳물 배출",
        description: "모든 반응이 끝나면, 아래쪽에 모인 순수한 쇳물(Molten Iron)을 배출구로 내보냅니다.",
        equation: "생산 완료!"
    }
];

let currentStep = 0;
let particles = [];

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function updateExplanation(stepIndex) {
    explanationCard.classList.add('hidden');
    setTimeout(() => {
        const step = steps[stepIndex];
        stepTitle.textContent = step.title;
        stepDescription.textContent = step.description;
        chemicalEquation.innerHTML = step.equation;
        explanationCard.classList.remove('hidden');
    }, 500);
}

async function startSimulation() {
    startBtn.classList.add('hidden');
    resetBtn.classList.remove('hidden');
    nextBtn.classList.remove('hidden');
    nextBtn.disabled = false;
    explanationCard.classList.remove('hidden');
    currentStep = 0;
    await runStep(currentStep);
}

async function handleNextStep() {
    currentStep++;
    if (currentStep < steps.length) {
        await runStep(currentStep);
    }
}

async function runStep(stepIndex) {
    nextBtn.disabled = true;
    updateExplanation(stepIndex);

    switch(stepIndex) {
        case 0:
            for (let i = 0; i < 30; i++) {
                createParticle();
                await wait(100);
            }
            moveParticlesDown();
            await wait(2000);
            break;
        case 1:
            blowHotAir();
            await wait(1000);
            await convertCokeToCO();
            await wait(3000); // Increased wait time for better observation
            hotAirContainer.innerHTML = '';
            break;
        case 2:
            await detailedReduceIronOre();
            await wait(3000); // Wait for new Fe particles to settle
            break;
        case 3:
            // Melt Fe particles and raise molten iron layer
            const feParticles = furnace.querySelectorAll('.fe-particle');
            feParticles.forEach(p => {
                p.style.transition = 'opacity 1s';
                p.style.opacity = '0';
            });
            moltenIronLayer.style.height = '120px';

            await wait(1000); // Wait for fade out
            feParticles.forEach(p => { if(p.parentElement) p.remove(); });
            
            await wait(3000); // Wait for molten layer animation to finish
            ironFlow.style.height = '100px';
            await wait(4000);
            break;
    }
    
    if (currentStep < steps.length - 1) {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = true;
        console.log("시뮬레이션 완료");
    }
}

function createParticle() {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    const type = Math.random();
    if (type < 0.6) {
        particle.classList.add('iron-ore');
        particle.innerHTML = 'Fe₂O₃';
    } else {
        particle.classList.add('coke');
        particle.innerHTML = 'C';
    }
    particle.style.left = `${Math.random() * (furnace.offsetWidth * 0.5) + (furnace.offsetWidth * 0.25)}px`;
    particle.style.top = `10px`;
    furnace.appendChild(particle);
    particles.push(particle);
}

function moveParticlesDown() {
   particles.forEach(p => {
       const newTop = Math.min(parseFloat(p.style.top) + 250 + Math.random() * 50, 480);
       const newLeft = parseFloat(p.style.left) + (Math.random() - 0.5) * 50;
       p.style.top = `${newTop}px`;
       p.style.left = `${newLeft}px`;
   });
}

function blowHotAir() {
    for (let i=0; i<5; i++){
        ['left', 'right'].forEach(side => {
            const air = document.createElement('div');
            air.className = `hot-air ${side === 'right' ? 'right-air' : ''}`;
            air.style.bottom = '110px';
            air.style[side] = '40px';
            air.style.animationDelay = `${i * 0.2}s`;
            hotAirContainer.appendChild(air);
        });
    }
}

async function convertCokeToCO() {
    // FIX: Lowered the filter threshold to select all fallen coke particles
    const cokes = Array.from(furnace.querySelectorAll('.coke')).filter(c => parseFloat(c.style.top) > 250);
    const promises = cokes.map(async (coke) => {
        coke.style.backgroundColor = 'orangered';
        coke.style.transform = 'scale(1.5)';
        await wait(1000);
        
        if (!coke.parentElement) return;

        const gas = document.createElement('div');
        gas.className = 'gas-particle co-gas';
        gas.innerHTML = 'CO';
        gas.style.left = coke.style.left;
        gas.style.top = coke.style.top;
        furnace.appendChild(gas);
        coke.remove();
        
        await wait(10);
        gas.style.opacity = '1';
        gas.style.transition = 'all 2s ease-out';
        const currentTop = parseFloat(gas.style.top);
        gas.style.top = `${currentTop - (150 + Math.random() * 50)}px`;
    });
    await Promise.all(promises);
}

async function detailedReduceIronOre() {
    const ironOres = Array.from(furnace.querySelectorAll('.iron-ore')).filter(ore => parseFloat(ore.style.top) > 200);
    let coGases = Array.from(furnace.querySelectorAll('.co-gas'));
    
    // FIX: Changed to a sequential for...of loop to prevent race conditions
    for (const ore of ironOres) {
        if (coGases.length < 3) {
            break; // Not enough CO gas left, stop reactions
        }
        
        const oreLeft = ore.style.left;
        const oreTop = ore.style.top;
        // Take 3 CO gases for the reaction safely
        const reactingGases = coGases.splice(0, 3);
        
        // Animate the gases moving to the ore
        const gasPromises = reactingGases.map(async (gas) => {
            await wait(Math.random() * 500);
            gas.style.transition = 'all 1.5s ease-in-out';
            gas.style.left = `calc(${oreLeft} + ${(Math.random() - 0.5) * 10}px)`;
            gas.style.top = `calc(${oreTop} + ${(Math.random() - 0.5) * 10}px)`;
            await wait(1500);

            if (!gas.parentElement) return;
            gas.innerHTML = 'CO₂';
            gas.classList.remove('co-gas');
            gas.classList.add('co2-gas');
            
            gas.style.transition = 'all 2s ease-in';
            gas.style.transform = `translateY(-200px)`;
            gas.style.opacity = '0';
            setTimeout(() => { if (gas.parentElement) gas.remove() }, 2000);
        });
        
        // Wait for the gases to finish their animation before transforming the ore
        await Promise.all(gasPromises);

        if (ore.parentElement) {
            ore.style.transition = 'opacity 0.5s, transform 0.5s';
            ore.style.opacity = '0';
            ore.style.transform = 'scale(0)';
            await wait(500);
            ore.remove();

            // Create two new Fe particles
            for (let i = 0; i < 2; i++) {
                const feParticle = document.createElement('div');
                feParticle.className = 'particle fe-particle';
                feParticle.innerHTML = 'Fe';
                feParticle.style.left = oreLeft;
                feParticle.style.top = oreTop;
                furnace.appendChild(feParticle);

                await wait(10);
                feParticle.style.transition = 'all 2s ease-in-out';
                const newLeft = `calc(${oreLeft} + ${(i === 0 ? -1 : 1) * 15}px)`;
                const newTop = `${parseFloat(oreTop) + 50 + Math.random() * 20}px`;
                feParticle.style.left = newLeft;
                feParticle.style.top = newTop;
            }
        }
         // Wait a bit before starting the next reaction for better visual pacing
        await wait(200);
    }
}

function resetSimulation() {
    currentStep = 0;
    furnace.innerHTML = `
        <div class="furnace-top"></div>
        <div class="hot-air-pipe left"></div>
        <div class="hot-air-pipe right"></div>
        <div id="hot-air-container"></div>
        <div class="liquid-layer molten-iron" id="molten-iron-layer"></div>
        <div class="tap-hole" style="bottom: 20px; right: -10px;"></div>
        <div class="molten-iron flow" id="iron-flow" style="bottom: 20px; right: -20px;"></div>
    `;
    particles = [];
    
    initDomElements();

    moltenIronLayer.style.height = '0';
    ironFlow.style.height = '0';

    explanationCard.classList.add('hidden');
    startBtn.classList.remove('hidden');
    resetBtn.classList.add('hidden');
    nextBtn.classList.add('hidden');
}

function initDomElements() {
     hotAirContainer = document.getElementById('hot-air-container');
     moltenIronLayer = document.getElementById('molten-iron-layer');
     ironFlow = document.getElementById('iron-flow');
}

startBtn.addEventListener('click', startSimulation);
resetBtn.addEventListener('click', resetSimulation);
nextBtn.addEventListener('click', handleNextStep);

initDomElements();