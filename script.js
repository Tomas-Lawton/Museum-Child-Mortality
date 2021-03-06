let isShowing = false;

document.getElementsByClassName('dropdown-link')[0].addEventListener('click', () => {
    if (!isShowing) {
        document.getElementsByClassName('dropdown-tab')[0].style.height = '100%';
        isShowing = true;
    } else {
        document.getElementsByClassName('dropdown-tab')[0].style.height = '0px';
        isShowing = false;

    }
});

document.getElementsByClassName('dropdown-link')[1].addEventListener('click', () => {
    if (!isShowing) {
        document.getElementsByClassName('dropdown-tab')[1].style.height = '100%';
        isShowing = true;
    } else {
        document.getElementsByClassName('dropdown-tab')[1].style.height = '0px';
        isShowing = false;

    }
});


const roundToFive = x => Math.round(x / 5) * 5
let year = 2050;

const upDateYearData = async(offset) => {
    const newYear = roundToFive(stretch(offset, startY, startY + lineHeight, 2050, 1950));
    year = newYear; //lazy global use
    document.getElementById('current-year').innerHTML = newYear;
    await updatePolygonsData(dataByYear[newYear]);
    calculateMetaData(dataByYear[newYear]);
}

// Doing this to avoid slow sorting of array: modified for object mortaility values instead of pure array.
// This allows me to take the middle of the result as the median.
function quickSortBasic(array) {
    if (array.length < 2) {
        return array;
    }

    var pivot = array[0];
    var lesserArray = [];
    var greaterArray = [];

    for (var i = 1; i < array.length; i++) {
        if (array[i].value > pivot.value) {
            greaterArray.push(array[i]);
        } else {
            lesserArray.push(array[i]);
        }
    }

    return quickSortBasic(lesserArray).concat(pivot, quickSortBasic(greaterArray));
}


const calculateMetaData = (worldData) => {
    var maxValue = 0;
    var maxCountry = '';
    var minValue = 10000;
    var minCountry = '';
    var countryCount = 0;

    var Mean = null;
    var meanCount = 0;
    // Update at the end with a quicksort
    var Median = [];

    for (const item in worldData) {
        if (Object.prototype.hasOwnProperty.call(worldData, item)) {
            if (worldData[item].mortalityValue > maxValue) {
                maxCountry = item;
                maxValue = Number(worldData[item].mortalityValue);
            }
            if (worldData[item].mortalityValue < minValue && worldData[item].mortalityValue >= 1) {
                minCountry = item;
                minValue = Number(worldData[item].mortalityValue);
            }
        }
        const [newMean, newCount] = updateMean(Mean, meanCount, Number(worldData[item].mortalityValue));
        Mean = newMean;
        meanCount = newCount;
        //Add country and value to Median and do a quicksort on it later after iteration. (Avoiding n^2)
        const keyValue = {
            key: item,
            value: Number(worldData[item].mortalityValue)
        }
        Median.push(keyValue);
    }


    // simple quickSort from the internet
    const sortedMedianArray = quickSortBasic(Median, 0, Median.length - 1);
    const medianCountry = sortedMedianArray[Math.floor(sortedMedianArray.length / 2)];

    const countriesAboveZero = (array) => {
        let counter = 0;
        for (let i = array.length - 1; i >= 0; i--) { //can't be higher
            if (array[i].value === 0) { return counter };
            counter++;
        }
        return array.length;
    }
    countryCount = countriesAboveZero(sortedMedianArray);


    document.getElementById('highest').innerHTML = `${maxCountry} ${maxValue}`;
    document.getElementById('mean').innerHTML = `Global Mean: ${Mean.toPrecision(4)}`;
    document.getElementById('median').innerHTML = `Global Median: ${medianCountry.value.toPrecision(4)}`;
    document.getElementById('median-country').innerHTML = `${medianCountry.key}`;
    document.getElementById('lowest').innerHTML = `Above Zero: ${countryCount}`;
    document.getElementById('info-text').innerHTML = countryCount === 215 ? `* All countries in data` : `` //use ternary to avoid "false"
}

//Create custom slider using p5.
const startY = 30;
const radius = 40
const startX = radius / 2;

const lineHeight = 235;
let ellipseY = startY
let ellipseX = startX;
let overBox = false;
let locked = false;
let isDragging = false;
let yOffset = 0.0;
let ellipseRadius = radius;
let radiusIsIncreasing = true;
let alpha = 255;

function setup() {
    let canvas = createCanvas(300, 300);
    canvas.parent('sketch-container');
}

function draw() {
    clear(); //bassically draw a transparent canvas

    stroke(240)
    strokeWeight(5)
    line(startX, startY, startX, startY + lineHeight)
    noStroke();
    fill(255, 255, 255);
    ellipse(startX, startY, 10);
    ellipse(startX, startY + lineHeight, 10);
    fill(112, 21, 109);

    if (
        mouseX > ellipseX - radius &&
        mouseX < ellipseX + radius &&
        mouseY > ellipseY - radius &&
        mouseY < ellipseY + radius
    ) {
        overBox = true;
        if (!locked) {
            // hover
            fill(169, 44, 165);
        }
    } else {
        fill(112, 21, 109);
        overBox = false;
    }

    if (isDragging) {
        upDateYearData(ellipseY);
    }
    animateThumb();
    let s = "Data After 2017 is Predicted";
    fill(255, alpha);
    text(s, ellipseX + 30, ellipseY, 300, 40);
}

const animateThumb = () => {
    ellipse(ellipseX, ellipseY, ellipseRadius);
    if (radiusIsIncreasing) {
        ellipseRadius += 0.1;
        alpha += 5;
    } else {
        ellipseRadius -= 0.1;
        alpha -= 5;
    }
    if (ellipseRadius >= radius + 1.5) {
        radiusIsIncreasing = false;
    }
    if (ellipseRadius <= radius - 1.5) {
        radiusIsIncreasing = true;
    }
}

function mousePressed() {
    if (overBox) {
        locked = true;
    } else {
        locked = false;
    }
    yOffset = mouseY - ellipseY;
    isDragging = true;
}

function mouseDragged() {
    if (locked) {
        ellipseY = mouseY - yOffset;
    }
    if (ellipseY > startY + lineHeight) {
        ellipseY = startY + lineHeight;
    }
    if (ellipseY < startY) {
        ellipseY = startY;
    }
}

function mouseReleased() {
    isDragging = false;
}

const initMusicPlayer = () => {
    // start playing
    var audio = new Audio('assets/Sad Emotional Dramatic Ambient Music - Circle of Life (Download and Copyright Free).mp3');
    audio.play();
    let buttonToggle = true;
    player = document.getElementById('play-sound');
    console.log('playing music');
    player.addEventListener('click', () => {
        console.log('toggle');
        if (buttonToggle) {
            player.src = "assets/sound-off.svg";
            audio.pause();
        } else {
            player.src = "assets/sound-on.svg";
            audio.play();
        }
        buttonToggle = !buttonToggle;
    });
}

// ENABLE SCROLL AFTER ENTERED.
const scrollToWorld = () => {
    // disable scrolling in current view
    // document.querySelector('body').classList.add('stop-scrolling');
    //show landing text
    const overlayContainer = document.getElementsByClassName('container-title')[0];
    overlayContainer.style.display = "grid";
    document.getElementsByClassName('hero-spacer')[0].visibility = "visible";
    document.getElementsByClassName('hero-spacer')[0].style.opacity = 1;

    console.log('page is fully loaded');
    const loader = document.getElementById('loader');
    loader.scrollTop = loader.scrollHeight;
    loader.style.display = 'none';

    const mainButton = document.getElementById("handleLanding");

    mainButton.addEventListener("click", () => {
        const worldElem = document.getElementById("globeViz");
        overlayContainer.style.display = "none";
        worldElem.style.transition = "all 1s";
        worldElem.style.filter = "none";

        initMusicPlayer();
        loadEdit();
        // Remove
        setTimeout(function() {
            worldElem.style.filter = "none";
            worldElem.classList.remove('globeBlur');
            document.getElementsByClassName('contain-scroll-button')[0].style.opacity = 0.8;
            document.getElementsByClassName('unhide').forEach((elem) => elem.style.opacity = 1);
        }, 2500);
    })
    scrollButton();
}

const scrollButton = () => {
    // Gross JQuery code pen code with some extra things thrown in
    $(function() {
        $('.scroll-down').click(function() {
            document.querySelector('body').classList.remove('stop-scrolling');
            $('html, body').animate({ scrollTop: $('section.main-content').offset().top - 150 }, 'slow');
            document.getElementsByClassName('contain-scroll-button')[0].style.transition = "all 500ms";
            document.getElementsByClassName('contain-scroll-button')[0].style.opacity = 0;
            return false;
        });
    });
}

async function loadEdit() {
    await updatePointOfView();
}

const CASES_API = "https://raw.githubusercontent.com/wobsoriano/covid3d/master/data.json";
const GEOJSON_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";
const GLOBE_IMAGE_URL = "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg";
const colorScale = d3.scaleSequential(d3.interpolateBuPu)
const altitude = 0.0063;

let dates;
let countries;
let featureCollection;

///HEAT MAPPER
const getVal = (feat) => {
    // console.log("FEATL ", feat);
    return Math.pow(feat.mortalityData.mortality, 1 / 4);
    // NOT NEEDED BECAUSE DATA ALREADY STANDARDISED.
    // Maps the mortality proportionally to the country population.
    // return Math.pow(feat.mortalityData.mortality / feat.properties.POP_EST, 1 / 4);
};

async function request(url) {
    try {
        const res = await fetch(url);
        const data = await res.json();
        return data;
    } catch (e) {
        throw e;
    }
}

async function getCoordinates() {
    try {
        const { latitude, longitude } = await request(
            "https://geolocation-db.com/json/"
        );
        return {
            latitude,
            longitude,
        };
    } catch (e) {
        throw e;
    }
}

const numberWithCommas = (x) => {
    // online example because regex is scary
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getPolygonLabel(countryInfo, countryData) {
    return `
            <div class="card">
                <h3 class="card-title">${countryInfo.NAME}</h3>
                <h3 class="card-title">${countryInfo.CONTINENT}</h3>
                <br/>
            <tr>
                <td class="data-entry"><strong>${year > 2017 ? 'Predicted' : 'Historical'}</strong> Mortality: ${
                    numberWithCommas(Number( countryData.mortality).toPrecision(3))}</td>
            </tr>
            <tr>
                <td class="data-entry">Current Economy: ${countryInfo.INCOME_GRP.slice(3)}</td>
            </tr>
            </div>
          `;
}

const extruder = (feat) => {
    return altitude + feat.mortalityData.mortality / 2000;
    // return altitude + (Math.sqrt(feat.mortalityData.mortality) * 0.22);
}

const countryColours = (feat) => {
    if (feat.mortalityData.mortality <= 0) {
        return "rgba(255, 255, 255, 0.1)";
    } else {
        return colorScale(getVal(feat));
    }
}

const initGlobe = async finishLoading => {
    const globeContainer = document.getElementById("globeViz");

    world = await Globe()(globeContainer)
        .globeImageUrl(GLOBE_IMAGE_URL)
        .showGraticules(false)
        .polygonAltitude(feat => extruder(feat))
        .backgroundColor("rgba(100, 100, 100, 0.0)")
        .showAtmosphere(true)
        .polygonCapColor(feat => countryColours(feat))
        .polygonSideColor(feat => countryColours(feat))
        .polygonStrokeColor(() => "rgba(255, 255, 255, 0.4)")
        .polygonLabel(feat => {
            const countryInfo = feat.properties;
            const countryData = feat.mortalityData;
            return getPolygonLabel(countryInfo, countryData);
        })
        .onPolygonHover((hoverD) =>
            world
            .polygonAltitude((d) => (d === hoverD ? extruder(d) + 0.05 : extruder(d)))
            .polygonCapColor((d) =>
                d === hoverD ? "rgb(21, 0, 37) 100.2%" : countryColours(d)
            )
        )
        .polygonsTransitionDuration(300)

    // Auto-rotate
    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 0.6;
    world.controls().enableZoom = false;
    // Default
    world.pointOfView({
            lat: null,
            lng: null,
            altitude: 1.1
        },
        0
    );

    await getCases();
    await window.addEventListener("resize", () => {
        world.width(window.innerWidth);
        world.height(window.innerHeight);
    });
    finishLoading();
}

async function getCases() {
    // All world countries
    countries = await request(CASES_API);
    // console.log("COVID, ", countries)
    // All country data
    featureCollection = (await request(GEOJSON_URL)).features;

    dates = Object.keys(countries.India);

    await updatePolygonsData(dataByYear[2050]);
}

function updatePolygonsData(earthDataCurrentYear) {
    for (let x = 0; x < featureCollection.length; x++) {
        // All availible countries on the globe.
        const country = featureCollection[x].properties.NAME;
        if (earthDataCurrentYear[country]) {
            featureCollection[x].mortalityData = {
                mortality: earthDataCurrentYear[country].mortalityValue
            };
        } else {
            featureCollection[x].mortalityData = {
                mortality: 0,
            };
        }
    }
    // const maxVal = Math.max(...featureCollection.map(getVal));
    // colorScale.domain([0, maxVal]);

    // Hard coded because I know the range and want it linear
    const maxVal = Math.pow(600, 1 / 4);
    colorScale.domain([0, maxVal]);
    world.polygonsData(featureCollection);
}

async function updatePointOfView() {
    try {
        const { latitude, longitude } = await getCoordinates();
        world.pointOfView({
                lat: latitude,
                lng: longitude,
                altitude: 2.15
            },
            3000
        );
    } catch (e) {
        console.log("Unable to set point of view.");
    }
}

initGlobe(scrollToWorld);