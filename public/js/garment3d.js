import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Parametric anatomical dress-form surface sampler.
 * theta = 0 is front (+Z), PI/2 is right (+X), PI is back (-Z).
 * y spans roughly -1.02 (upper thigh) to 1.24 (neck top).
 */
function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function gaussian(x, mu, sigma) {
  const d = (x - mu) / sigma;
  return Math.exp(-0.5 * d * d);
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function sampleBodyPoint(theta, y, offset = 0) {
  // Base elliptical profile along height y
  let rx = 0.42;
  let rz = 0.28;

  // Hip & pelvis fullness around y = -0.68
  const hipCurve = gaussian(y, -0.68, 0.34);
  // Waist cinch around y = -0.08
  const waistCinch = gaussian(y, -0.08, 0.24);
  // Ribcage / upper chest flare around y = 0.46
  const chestCurve = gaussian(y, 0.46, 0.32);
  // Shoulder cap around y = 0.88
  const shoulderCap = smoothstep(0.84, 1.08, y);
  // Neck column above y = 1.02
  const neckBlend = smoothstep(0.96, 1.12, y);

  rx = 0.41 + 0.145 * hipCurve - 0.085 * waistCinch + 0.055 * chestCurve;
  rz = 0.265 + 0.072 * hipCurve - 0.048 * waistCinch + 0.032 * chestCurve;

  // Subtle taper at lower thigh base
  const bottomTaper = smoothstep(-0.78, -1.04, y);
  rx *= 1 - 0.14 * bottomTaper;
  rz *= 1 - 0.12 * bottomTaper;

  // Taper shoulders into neck
  rx = rx * (1 - 0.68 * neckBlend) + 0.135 * neckBlend;
  rz = rz * (1 - 0.52 * neckBlend) + 0.13 * neckBlend;
  // Soften shoulder slope
  rx *= 1 - 0.12 * shoulderCap * (1 - neckBlend);

  const sinT = Math.sin(theta);
  const cosT = Math.cos(theta);

  let x = rx * sinT;
  let z = rz * cosT;

  // Anatomical bust contour (two smooth front lobes)
  const bustY = gaussian(y, 0.47, 0.155);
  const leftLobe = gaussian(angleDiff(theta, 0.42), 0, 0.34);
  const rightLobe = gaussian(angleDiff(theta, -0.42), 0, 0.34);
  const bustProj = 0.165 * bustY * (leftLobe + rightLobe) * (1 - neckBlend);

  // Subtle sternum valley between cups
  const sternumDip = 0.025 * bustY * gaussian(angleDiff(theta, 0), 0, 0.14);

  // Back spine & glute contour
  const gluteY = gaussian(y, -0.68, 0.22);
  const backL = gaussian(angleDiff(theta, Math.PI - 0.38), 0, 0.36);
  const backR = gaussian(angleDiff(theta, Math.PI + 0.38), 0, 0.36);
  const gluteProj = 0.095 * gluteY * (backL + backR);

  // Slight lumbar inward curve
  const lumbarDip = 0.03 * gaussian(y, -0.14, 0.2) * gaussian(angleDiff(theta, Math.PI), 0, 0.45);

  z += bustProj - sternumDip - gluteProj + lumbarDip;

  // Outward offset for garments fitting over the form
  if (offset !== 0) {
    const len = Math.hypot(x, z) || 1;
    x += (x / len) * offset;
    z += (z / len) * offset;
  }

  return new THREE.Vector3(x, y, z);
}

/**
 * Generates procedural canvas bump + alpha maps for Mulberry Silk, Chantilly Lace, Micro-Modal, and Tulle Mesh.
 */
const textureCache = new Map();

function getFabricTextures(pattern) {
  if (textureCache.has(pattern)) return textureCache.get(pattern);

  const size = 512;
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  const alphaCanvas = document.createElement('canvas');
  alphaCanvas.width = size;
  alphaCanvas.height = size;
  const aCtx = alphaCanvas.getContext('2d');

  // Default opaque alpha
  aCtx.fillStyle = '#ffffff';
  aCtx.fillRect(0, 0, size, size);

  if (pattern === 'silk') {
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, size, size);
    bCtx.strokeStyle = 'rgba(255,255,255,0.12)';
    bCtx.lineWidth = 1;
    for (let i = -size; i < size * 2; i += 4) {
      bCtx.beginPath();
      bCtx.moveTo(i, 0);
      bCtx.lineTo(i + size, size);
      bCtx.stroke();
    }
  } else if (pattern === 'rib') {
    bCtx.fillStyle = '#787878';
    bCtx.fillRect(0, 0, size, size);
    for (let x = 0; x < size; x += 6) {
      bCtx.fillStyle = x % 12 === 0 ? '#a8a8a8' : '#585858';
      bCtx.fillRect(x, 0, 3, size);
    }
  } else if (pattern === 'mesh') {
    bCtx.fillStyle = '#707070';
    bCtx.fillRect(0, 0, size, size);
    aCtx.fillStyle = '#b4b4b4';
    aCtx.fillRect(0, 0, size, size);
    const step = 12;
    bCtx.strokeStyle = '#d4d4d4';
    aCtx.strokeStyle = '#ffffff';
    bCtx.lineWidth = 1.4;
    aCtx.lineWidth = 1.6;
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        bCtx.beginPath();
        bCtx.moveTo(x, y + step / 2);
        bCtx.lineTo(x + step / 2, y);
        bCtx.lineTo(x + step, y + step / 2);
        bCtx.lineTo(x + step / 2, y + step);
        bCtx.closePath();
        bCtx.stroke();

        aCtx.beginPath();
        aCtx.moveTo(x, y + step / 2);
        aCtx.lineTo(x + step / 2, y);
        aCtx.lineTo(x + step, y + step / 2);
        aCtx.lineTo(x + step / 2, y + step);
        aCtx.closePath();
        aCtx.stroke();
      }
    }
  } else if (pattern === 'lace') {
    bCtx.fillStyle = '#404040';
    bCtx.fillRect(0, 0, size, size);
    aCtx.fillStyle = '#9a9a9a';
    aCtx.fillRect(0, 0, size, size);

    // Fine background net
    aCtx.strokeStyle = '#c8c8c8';
    aCtx.lineWidth = 1;
    for (let i = -size; i < size * 2; i += 14) {
      aCtx.beginPath();
      aCtx.moveTo(i, 0);
      aCtx.lineTo(i + size, size);
      aCtx.stroke();
      aCtx.beginPath();
      aCtx.moveTo(i + size, 0);
      aCtx.lineTo(i, size);
      aCtx.stroke();
    }

    // Botanical floral rosettes
    const cell = 64;
    for (let gy = cell / 2; gy < size; gy += cell) {
      for (let gx = cell / 2; gx < size; gx += cell) {
        const cx = gx + ((gy / cell) % 2 === 0 ? 0 : cell / 2);
        for (let p = 0; p < 6; p++) {
          const ang = (p / 6) * Math.PI * 2;
          const px = cx + Math.cos(ang) * 14;
          const py = gy + Math.sin(ang) * 14;
          bCtx.fillStyle = '#efefef';
          bCtx.beginPath();
          bCtx.arc(px, py, 8.5, 0, Math.PI * 2);
          bCtx.fill();

          aCtx.fillStyle = '#ffffff';
          aCtx.beginPath();
          aCtx.arc(px, py, 8.5, 0, Math.PI * 2);
          aCtx.fill();
        }
        bCtx.fillStyle = '#ffffff';
        bCtx.beginPath();
        bCtx.arc(cx, gy, 5.5, 0, Math.PI * 2);
        bCtx.fill();

        aCtx.fillStyle = '#ffffff';
        aCtx.beginPath();
        aCtx.arc(cx, gy, 5.5, 0, Math.PI * 2);
        aCtx.fill();
      }
    }
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(4, 4);

  const alphaMap = new THREE.CanvasTexture(alphaCanvas);
  alphaMap.wrapS = alphaMap.wrapT = THREE.RepeatWrapping;
  alphaMap.repeat.set(4, 4);

  const pack = { bumpMap, alphaMap };
  textureCache.set(pattern, pack);
  return pack;
}

/**
 * Builds a UV-mapped parametric cloth patch on the body form between thetaStart..thetaEnd
 * where yMinFn(theta) and yMaxFn(theta) define sculpted neckline/hem/leg curves.
 */
function createTailoredPatchGeometry({
  thetaStart = -Math.PI,
  thetaEnd = Math.PI,
  uSteps = 72,
  vSteps = 28,
  yMinFn,
  yMaxFn,
  offset = 0.02
}) {
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let iv = 0; iv <= vSteps; iv++) {
    const v = iv / vSteps;
    for (let iu = 0; iu <= uSteps; iu++) {
      const u = iu / uSteps;
      const theta = thetaStart + (thetaEnd - thetaStart) * u;
      const yMin = yMinFn(theta, u);
      const yMax = yMaxFn(theta, u);
      const y = yMin + (yMax - yMin) * v;

      // Slight pinch toward neckline & hem for flush couture edge
      const edgeTaper = Math.sin(v * Math.PI);
      const localOffset = offset * (0.72 + 0.28 * edgeTaper);
      const pt = sampleBodyPoint(theta, y, localOffset);

      positions.push(pt.x, pt.y, pt.z);
      uvs.push(u * 2, v);
    }
  }

  const stride = uSteps + 1;
  for (let iv = 0; iv < vSteps; iv++) {
    for (let iu = 0; iu < uSteps; iu++) {
      const a = iv * stride + iu;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function createStrapCurve(thetaAnchor, yStart, yBack, offset = 0.024) {
  const pts = [];
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (t < 0.5) {
      const lt = t * 2;
      const y = yStart + (0.98 - yStart) * lt;
      const th = thetaAnchor * (1 - lt * 0.1);
      pts.push(sampleBodyPoint(th, y, offset + 0.008 * Math.sin(lt * Math.PI)));
    } else {
      const lt = (t - 0.5) * 2;
      const y = 0.98 + (yBack - 0.98) * lt;
      const sideSign = thetaAnchor >= 0 ? 1 : -1;
      const th = sideSign * (Math.abs(thetaAnchor) * 0.9 + (Math.PI - Math.abs(thetaAnchor) * 1.45) * lt);
      pts.push(sampleBodyPoint(th, y, offset + 0.006 * Math.sin(lt * Math.PI)));
    }
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, 28, 0.011, 10, false);
}

function createTrimRibbon(thetaStart, thetaEnd, yFn, offset = 0.025, radius = 0.0085) {
  const pts = [];
  const steps = 56;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const th = thetaStart + (thetaEnd - thetaStart) * u;
    pts.push(sampleBodyPoint(th, yFn(th), offset));
  }
  const curve = new THREE.CatmullRomCurve3(pts, Math.abs(thetaEnd - thetaStart) > Math.PI * 1.98);
  return new THREE.TubeGeometry(curve, 72, radius, 8, false);
}

/**
 * Builds the dressmaker mannequin form + brass stand.
 */
function buildMannequinGroup() {
  const group = new THREE.Group();

  // Torso shell
  const torsoGeo = createTailoredPatchGeometry({
    thetaStart: 0,
    thetaEnd: Math.PI * 2,
    uSteps: 96,
    vSteps: 64,
    yMinFn: () => -1.04,
    yMaxFn: () => 1.24,
    offset: 0
  });

  const mannequinMat = new THREE.MeshPhysicalMaterial({
    color: 0xf1e6db,
    roughness: 0.62,
    metalness: 0.02,
    sheen: 0.28,
    sheenColor: new THREE.Color(0xffffff),
    sheenRoughness: 0.7,
    side: THREE.DoubleSide
  });

  const torsoMesh = new THREE.Mesh(torsoGeo, mannequinMat);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  group.add(torsoMesh);

  // Brass stand hardware
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd3b282,
    roughness: 0.28,
    metalness: 0.88
  });

  // Neck finial cap
  const neckCap = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.142, 0.045, 32), brassMat);
  neckCap.position.y = 1.255;
  group.add(neckCap);

  const finialKnob = new THREE.Mesh(new THREE.SphereGeometry(0.055, 24, 18), brassMat);
  finialKnob.position.y = 1.31;
  group.add(finialKnob);

  // Base plate under torso
  const hipCap = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.04, 36), brassMat);
  hipCap.position.y = -1.045;
  group.add(hipCap);

  // Stand rod
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.032, 0.62, 20), brassMat);
  pole.position.y = -1.35;
  group.add(pole);

  // Travertine-tone base pedestal
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0xe6ddd2,
    roughness: 0.55,
    metalness: 0.05
  });
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.07, 48), baseMat);
  pedestal.position.y = -1.67;
  pedestal.receiveShadow = true;
  group.add(pedestal);

  return group;
}

/**
 * Garment assembly helpers for each modelType
 */
function buildBraMeshGroup(variant, fabricMat, trimMat, hardwareMat) {
  const group = new THREE.Group();

  const isDemi = variant === 'demi-bra' || variant === 'balconette-set';

  // Sculpted wrap-around band + front cups
  const braGeo = createTailoredPatchGeometry({
    thetaStart: -Math.PI,
    thetaEnd: Math.PI,
    uSteps: 96,
    vSteps: 28,
    yMinFn: (th) => {
      const frontWeight = Math.max(0, Math.cos(th));
      return 0.23 - 0.015 * frontWeight;
    },
    yMaxFn: (th) => {
      const absT = Math.abs(th);
      const backDip = smoothstep(0.95, 2.2, absT);
      // Sweetheart / balconette cup lobes around th = +-0.44
      const leftCup = gaussian(angleDiff(th, 0.44), 0, 0.34);
      const rightCup = gaussian(angleDiff(th, -0.44), 0, 0.34);
      const cupApex = isDemi ? 0.59 : 0.68;
      const frontBase = isDemi ? 0.39 : 0.36;
      const frontHeight = frontBase + (cupApex - frontBase) * Math.min(1, leftCup + rightCup);
      return frontHeight * (1 - backDip) + 0.36 * backDip;
    },
    offset: 0.024
  });

  const braMesh = new THREE.Mesh(braGeo, fabricMat);
  braMesh.castShadow = true;
  group.add(braMesh);

  // Underband trim ribbon
  const underband = new THREE.Mesh(
    createTrimRibbon(-Math.PI, Math.PI, (th) => 0.23 - 0.015 * Math.max(0, Math.cos(th)), 0.027, 0.009),
    trimMat
  );
  group.add(underband);

  // Upper cup piping
  const topTrim = new THREE.Mesh(
    createTrimRibbon(
      -0.95,
      0.95,
      (th) => {
        const leftCup = gaussian(angleDiff(th, 0.44), 0, 0.34);
        const rightCup = gaussian(angleDiff(th, -0.44), 0, 0.34);
        const cupApex = isDemi ? 0.59 : 0.68;
        const frontBase = isDemi ? 0.39 : 0.36;
        return frontBase + (cupApex - frontBase) * Math.min(1, leftCup + rightCup);
      },
      0.028,
      0.007
    ),
    trimMat
  );
  group.add(topTrim);

  // Straps
  const strapAnchorY = isDemi ? 0.56 : 0.64;
  group.add(new THREE.Mesh(createStrapCurve(0.46, strapAnchorY, 0.36), trimMat));
  group.add(new THREE.Mesh(createStrapCurve(-0.46, strapAnchorY, 0.36), trimMat));

  // Hardware: center gore charm + strap sliders + back hook clasp
  const centerCharm = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.004, 12, 24), hardwareMat);
  const gorePos = sampleBodyPoint(0, 0.35, 0.032);
  centerCharm.position.copy(gorePos);
  group.add(centerCharm);

  [-0.46, 0.46].forEach((th) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.015, 0.0038, 10, 24), hardwareMat);
    ring.position.copy(sampleBodyPoint(th, strapAnchorY + 0.02, 0.032));
    group.add(ring);
  });

  // Back clasp bar
  const claspBar = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.06, 0.012), hardwareMat);
  claspBar.position.copy(sampleBodyPoint(Math.PI, 0.29, 0.03));
  group.add(claspBar);

  return group;
}

function buildBriefMeshGroup(highWaist, fabricMat, trimMat, hardwareMat) {
  const group = new THREE.Group();

  const waistY = highWaist ? -0.14 : -0.34;
  const hipEdgeY = highWaist ? -0.34 : -0.46;

  const briefGeo = createTailoredPatchGeometry({
    thetaStart: -Math.PI,
    thetaEnd: Math.PI,
    uSteps: 96,
    vSteps: 28,
    yMinFn: (th) => {
      // High-cut leg arches at sides, dipping gracefully at front & back gusset
      const frontGusset = gaussian(angleDiff(th, 0), 0, 0.42);
      const backCoverage = gaussian(angleDiff(th, Math.PI), 0, 0.68);
      const sideArch = Math.max(
        gaussian(angleDiff(th, Math.PI / 2), 0, 0.48),
        gaussian(angleDiff(th, -Math.PI / 2), 0, 0.48)
      );
      return -0.84 + 0.32 * sideArch - 0.12 * frontGusset - 0.06 * backCoverage;
    },
    yMaxFn: (th) => {
      const sideCurve = Math.abs(Math.sin(th));
      return waistY * (1 - 0.15 * sideCurve) + hipEdgeY * 0.15 * sideCurve;
    },
    offset: 0.024
  });

  const briefMesh = new THREE.Mesh(briefGeo, fabricMat);
  briefMesh.castShadow = true;
  group.add(briefMesh);

  // Scalloped waist band ribbon
  const waistRibbon = new THREE.Mesh(
    createTrimRibbon(
      -Math.PI,
      Math.PI,
      (th) => {
        const sideCurve = Math.abs(Math.sin(th));
        return waistY * (1 - 0.15 * sideCurve) + hipEdgeY * 0.15 * sideCurve;
      },
      0.027,
      0.01
    ),
    trimMat
  );
  group.add(waistRibbon);

  // Delicate front waist hardware tag
  const waistCharm = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.016, 0.008), hardwareMat);
  waistCharm.position.copy(sampleBodyPoint(0, waistY - 0.02, 0.03));
  group.add(waistCharm);

  return group;
}

function buildBodysuitMeshGroup(fabricMat, trimMat, hardwareMat) {
  const group = new THREE.Group();

  const bodyGeo = createTailoredPatchGeometry({
    thetaStart: -Math.PI,
    thetaEnd: Math.PI,
    uSteps: 96,
    vSteps: 44,
    yMinFn: (th) => {
      const frontGusset = gaussian(angleDiff(th, 0), 0, 0.38);
      const backCoverage = gaussian(angleDiff(th, Math.PI), 0, 0.62);
      const sideArch = Math.max(
        gaussian(angleDiff(th, Math.PI / 2), 0, 0.46),
        gaussian(angleDiff(th, -Math.PI / 2), 0, 0.46)
      );
      return -0.84 + 0.34 * sideArch - 0.12 * frontGusset - 0.06 * backCoverage;
    },
    yMaxFn: (th) => {
      const absT = Math.abs(th);
      const backCutout = smoothstep(0.95, 2.3, absT);
      const plungeCenter = gaussian(angleDiff(th, 0), 0, 0.18);
      const leftCup = gaussian(angleDiff(th, 0.44), 0, 0.34);
      const rightCup = gaussian(angleDiff(th, -0.44), 0, 0.34);
      const frontLine = 0.38 + 0.30 * Math.min(1, leftCup + rightCup) - 0.24 * plungeCenter;
      const backLine = 0.24;
      return frontLine * (1 - backCutout) + backLine * backCutout;
    },
    offset: 0.024
  });

  const bodyMesh = new THREE.Mesh(bodyGeo, fabricMat);
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Plunge neckline piping
  const neckTrim = new THREE.Mesh(
    createTrimRibbon(
      -0.95,
      0.95,
      (th) => {
        const plungeCenter = gaussian(angleDiff(th, 0), 0, 0.18);
        const leftCup = gaussian(angleDiff(th, 0.44), 0, 0.34);
        const rightCup = gaussian(angleDiff(th, -0.44), 0, 0.34);
        return 0.38 + 0.30 * Math.min(1, leftCup + rightCup) - 0.24 * plungeCenter;
      },
      0.028,
      0.008
    ),
    trimMat
  );
  group.add(neckTrim);

  // Waist cinch seam accent
  const waistSeam = new THREE.Mesh(
    createTrimRibbon(-Math.PI, Math.PI, () => -0.08, 0.026, 0.0055),
    trimMat
  );
  group.add(waistSeam);

  group.add(new THREE.Mesh(createStrapCurve(0.46, 0.65, 0.25), trimMat));
  group.add(new THREE.Mesh(createStrapCurve(-0.46, 0.65, 0.25), trimMat));

  // Hardware sliders
  [-0.46, 0.46].forEach((th) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.015, 0.0038, 10, 24), hardwareMat);
    ring.position.copy(sampleBodyPoint(th, 0.67, 0.032));
    group.add(ring);
  });

  return group;
}

function buildSilkSlipMeshGroup(fabricMat, trimMat, hardwareMat) {
  const group = new THREE.Group();

  // Bias-cut fluid A-line drape around lower hip
  const positions = [];
  const uvs = [];
  const indices = [];
  const uSteps = 96;
  const vSteps = 40;

  for (let iv = 0; iv <= vSteps; iv++) {
    const v = iv / vSteps;
    for (let iu = 0; iu <= uSteps; iu++) {
      const u = iu / uSteps;
      const th = -Math.PI + Math.PI * 2 * u;

      const absT = Math.abs(th);
      const backDip = smoothstep(1.0, 2.3, absT);
      const cowlDip = gaussian(angleDiff(th, 0), 0, 0.28);
      const leftPeak = gaussian(angleDiff(th, 0.44), 0, 0.28);
      const rightPeak = gaussian(angleDiff(th, -0.44), 0, 0.28);
      const frontTop = 0.46 + 0.22 * Math.min(1, leftPeak + rightPeak) - 0.14 * cowlDip;
      const topY = frontTop * (1 - backDip) + 0.36 * backDip;

      // Subtle asymmetrical handkerchief/bias hem wave
      const hemY = -0.96 + 0.05 * Math.sin(th * 2);
      const y = hemY + (topY - hemY) * v;

      // Fluid skirt flare below waist
      const flare = smoothstep(0.15, -0.96, y) * 0.095 + 0.022 * Math.sin(th * 6) * smoothstep(0.0, -0.96, y);
      const pt = sampleBodyPoint(th, y, 0.028 + flare);
      positions.push(pt.x, pt.y, pt.z);
      uvs.push(u * 2, v * 1.5);
    }
  }

  const stride = uSteps + 1;
  for (let iv = 0; iv < vSteps; iv++) {
    for (let iu = 0; iu < uSteps; iu++) {
      const a = iv * stride + iu;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  }

  const slipGeo = new THREE.BufferGeometry();
  slipGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  slipGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  slipGeo.setIndex(indices);
  slipGeo.computeVertexNormals();

  const slipMesh = new THREE.Mesh(slipGeo, fabricMat);
  slipMesh.castShadow = true;
  group.add(slipMesh);

  // Delicate rouleau straps & ring hardware
  group.add(new THREE.Mesh(createStrapCurve(0.44, 0.66, 0.37, 0.03), trimMat));
  group.add(new THREE.Mesh(createStrapCurve(-0.44, 0.66, 0.37, 0.03), trimMat));

  [-0.44, 0.44].forEach((th) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.013, 0.0035, 10, 20), hardwareMat);
    ring.position.copy(sampleBodyPoint(th, 0.67, 0.036));
    group.add(ring);
  });

  return group;
}

function buildNightyRobeMeshGroup(fabricMat, trimMat, hardwareMat) {
  const group = new THREE.Group();
  // Inner silk nighty slip
  group.add(buildSilkSlipMeshGroup(fabricMat, trimMat, hardwareMat));

  // Open-front draped bridal robe wrapping back & sides
  const positions = [];
  const uvs = [];
  const indices = [];
  const uSteps = 72;
  const vSteps = 34;

  for (let iv = 0; iv <= vSteps; iv++) {
    const v = iv / vSteps;
    for (let iu = 0; iu <= uSteps; iu++) {
      const u = iu / uSteps;
      // Leave open front gap between -0.38 and +0.38 rad
      const th = 0.36 + (Math.PI * 2 - 0.72) * u;
      const topY = 0.88 - 0.14 * Math.max(0, Math.cos(th));
      const hemY = -1.04 + 0.04 * Math.sin(th * 3);
      const y = hemY + (topY - hemY) * v;
      const flare = smoothstep(0.2, -1.04, y) * 0.15;
      const pt = sampleBodyPoint(th, y, 0.055 + flare);
      positions.push(pt.x, pt.y, pt.z);
      uvs.push(u * 2, v * 1.5);
    }
  }
  const stride = uSteps + 1;
  for (let iv = 0; iv < vSteps; iv++) {
    for (let iu = 0; iu < uSteps; iu++) {
      const a = iv * stride + iu;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  }
  const robeGeo = new THREE.BufferGeometry();
  robeGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  robeGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  robeGeo.setIndex(indices);
  robeGeo.computeVertexNormals();
  group.add(new THREE.Mesh(robeGeo, trimMat));

  // Waist tie sash + gold tip tassels
  const sash = new THREE.Mesh(
    createTrimRibbon(-Math.PI, Math.PI, () => -0.06, 0.062, 0.015),
    hardwareMat
  );
  group.add(sash);
  return group;
}

function buildBridalLehengaMeshGroup(fabricMat, trimMat, hardwareMat) {
  const group = new THREE.Group();

  // Fitted Choli blouse
  const choliGeo = createTailoredPatchGeometry({
    thetaStart: -Math.PI,
    thetaEnd: Math.PI,
    uSteps: 84,
    vSteps: 24,
    yMinFn: () => 0.18,
    yMaxFn: (th) => {
      const absT = Math.abs(th);
      const backDip = smoothstep(1.0, 2.3, absT);
      const frontNeck = 0.66 - 0.16 * gaussian(angleDiff(th, 0), 0, 0.25);
      return frontNeck * (1 - backDip) + 0.56 * backDip;
    },
    offset: 0.028
  });
  group.add(new THREE.Mesh(choliGeo, fabricMat));
  group.add(new THREE.Mesh(createTrimRibbon(-Math.PI, Math.PI, () => 0.18, 0.032, 0.012), hardwareMat));

  // Dramatic flared pleated Lehenga skirt
  const positions = [];
  const uvs = [];
  const indices = [];
  const uSteps = 96;
  const vSteps = 32;
  for (let iv = 0; iv <= vSteps; iv++) {
    const v = iv / vSteps;
    const y = -1.24 + (0.04 - -1.24) * v; // -1.24 hem to +0.04 waist
    const flareProgress = 1 - v;
    for (let iu = 0; iu <= uSteps; iu++) {
      const u = iu / uSteps;
      const th = u * Math.PI * 2;
      const pleat = Math.sin(th * 16) * 0.025 * flareProgress;
      const basePt = sampleBodyPoint(th, Math.max(-0.9, y), 0.03);
      const radiusMult = 1 + flareProgress * 0.92;
      positions.push(
        basePt.x * radiusMult + Math.sin(th) * pleat,
        y,
        basePt.z * radiusMult + Math.cos(th) * pleat
      );
      uvs.push(u * 4, v * 2);
    }
  }
  const stride = uSteps + 1;
  for (let iv = 0; iv < vSteps; iv++) {
    for (let iu = 0; iu < uSteps; iu++) {
      const a = iv * stride + iu;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, b, d, a, d, c);
    }
  }
  const skirtGeo = new THREE.BufferGeometry();
  skirtGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  skirtGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  skirtGeo.setIndex(indices);
  skirtGeo.computeVertexNormals();
  group.add(new THREE.Mesh(skirtGeo, fabricMat));

  // Zardozi gold hem border ring
  const hemRing = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.024, 14, 72), hardwareMat);
  hemRing.rotation.x = Math.PI / 2;
  hemRing.scale.set(1.02, 0.76, 1);
  hemRing.position.y = -1.22;
  group.add(hemRing);

  // Sweeping dupatta drape across torso
  const dupPts = [
    sampleBodyPoint(-0.75, -0.85, 0.45),
    sampleBodyPoint(-0.35, -0.1, 0.16),
    sampleBodyPoint(0.25, 0.55, 0.08),
    sampleBodyPoint(0.75, 0.92, 0.06),
    sampleBodyPoint(2.2, 0.25, 0.14),
    sampleBodyPoint(2.6, -0.75, 0.35)
  ];
  const dupCurve = new THREE.CatmullRomCurve3(dupPts);
  const dupGeo = new THREE.TubeGeometry(dupCurve, 44, 0.045, 10, false);
  const dupMat = trimMat.clone();
  dupMat.transparent = true;
  dupMat.opacity = 0.68;
  group.add(new THREE.Mesh(dupGeo, dupMat));

  return group;
}

function buildKurtaShararaMeshGroup(fabricMat, trimMat, hardwareMat) {
  const group = new THREE.Group();

  // Long embroidered Kurta tunic
  const kurtaGeo = createTailoredPatchGeometry({
    thetaStart: -Math.PI,
    thetaEnd: Math.PI,
    uSteps: 84,
    vSteps: 36,
    yMinFn: (th) => -0.42 + 0.08 * Math.pow(Math.abs(Math.sin(th)), 2),
    yMaxFn: () => 0.84,
    offset: 0.036
  });
  group.add(new THREE.Mesh(kurtaGeo, fabricMat));
  group.add(new THREE.Mesh(createTrimRibbon(-Math.PI, Math.PI, () => -0.38, 0.04, 0.01), hardwareMat));

  // Twin flared Sharara legs
  [-0.22, 0.22].forEach((xOffset) => {
    const legGeo = new THREE.CylinderGeometry(0.18, 0.38, 0.86, 32, 8, true);
    const leg = new THREE.Mesh(legGeo, trimMat);
    leg.position.set(xOffset, -0.8, 0);
    group.add(leg);

    const gotaBorder = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.014, 10, 40), hardwareMat);
    gotaBorder.rotation.x = Math.PI / 2;
    gotaBorder.position.set(xOffset, -1.22, 0);
    group.add(gotaBorder);
  });

  // Organza dupatta sash
  const dupCurve = new THREE.CatmullRomCurve3([
    sampleBodyPoint(-0.8, -0.7, 0.26),
    sampleBodyPoint(-0.2, 0.2, 0.11),
    sampleBodyPoint(0.55, 0.85, 0.06),
    sampleBodyPoint(2.3, 0.1, 0.12)
  ]);
  const dupMat = fabricMat.clone();
  dupMat.transparent = true;
  dupMat.opacity = 0.72;
  group.add(new THREE.Mesh(new THREE.TubeGeometry(dupCurve, 36, 0.042, 10, false), dupMat));

  return group;
}

function buildBridalSandalMeshGroup(fabricMat, trimMat, hardwareMat) {
  const group = new THREE.Group();

  // Elegant round velvet display plinth
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.88, 0.94, 0.08, 48),
    new THREE.MeshStandardMaterial({ color: 0xf3e8ee, roughness: 0.45, metalness: 0.08 })
  );
  plinth.position.y = -0.36;
  group.add(plinth);

  [-0.36, 0.36].forEach((xPos, idx) => {
    const shoe = new THREE.Group();

    // Sculpted high-heel sole curve
    const soleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.32, -0.48),
      new THREE.Vector3(0, 0.18, -0.18),
      new THREE.Vector3(0, 0.02, 0.14),
      new THREE.Vector3(0, 0.04, 0.52)
    ]);
    const soleGeo = new THREE.TubeGeometry(soleCurve, 28, 0.06, 12, false);
    soleGeo.scale(2.4, 0.32, 1);
    const sole = new THREE.Mesh(soleGeo, fabricMat);
    shoe.add(sole);

    // Metallic block / stiletto heel
    const heel = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.042, 0.35, 18), hardwareMat);
    heel.position.set(0, 0.14, -0.45);
    shoe.add(heel);

    // Embellished front toe strap
    const toeStrap = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.028, 12, 28, Math.PI), trimMat);
    toeStrap.position.set(0, 0.04, 0.3);
    shoe.add(toeStrap);

    // Pearl/Gold cluster ornament on strap
    for (let p = -1; p <= 1; p++) {
      const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.022, 14, 14), hardwareMat);
      pearl.position.set(p * 0.05, 0.19 - Math.abs(p) * 0.02, 0.3);
      shoe.add(pearl);
    }

    // Ankle cuff strap + gold buckle
    const ankleStrap = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 12, 28), hardwareMat);
    ankleStrap.rotation.x = Math.PI / 2 - 0.15;
    ankleStrap.position.set(0, 0.44, -0.38);
    shoe.add(ankleStrap);

    shoe.position.set(xPos, -0.28, 0);
    shoe.rotation.y = idx === 0 ? 0.25 : -0.22;
    group.add(shoe);
  });

  return group;
}

function buildBridalKhussaMeshGroup(fabricMat, trimMat, hardwareMat) {
  const group = new THREE.Group();

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.88, 0.94, 0.08, 48),
    new THREE.MeshStandardMaterial({ color: 0xf7efe6, roughness: 0.48, metalness: 0.05 })
  );
  plinth.position.y = -0.32;
  group.add(plinth);

  [-0.36, 0.36].forEach((xPos, idx) => {
    const khussa = new THREE.Group();

    // Boat-shaped khussa base
    const baseGeo = new THREE.CapsuleGeometry(0.15, 0.56, 12, 24);
    baseGeo.rotateX(Math.PI / 2);
    baseGeo.scale(1.05, 0.48, 1.0);
    const body = new THREE.Mesh(baseGeo, fabricMat);
    khussa.add(body);

    // Traditional curved pointed khussa toe tip
    const tipCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.0, 0.36),
      new THREE.Vector3(0, 0.08, 0.54),
      new THREE.Vector3(0, 0.22, 0.58)
    ]);
    const tip = new THREE.Mesh(new THREE.TubeGeometry(tipCurve, 16, 0.042, 10, false), hardwareMat);
    khussa.add(tip);

    // Tilla gold rim embroidery along opening
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.015, 10, 32), hardwareMat);
    rim.rotation.x = Math.PI / 2;
    rim.scale.set(0.95, 1.8, 1);
    rim.position.y = 0.07;
    khussa.add(rim);

    // Decorative front zardozi medallion
    const motif = new THREE.Mesh(new THREE.SphereGeometry(0.036, 16, 14), trimMat);
    motif.scale.set(1.2, 0.5, 1.5);
    motif.position.set(0, 0.08, 0.24);
    khussa.add(motif);

    khussa.position.set(xPos, -0.2, 0);
    khussa.rotation.y = idx === 0 ? 0.24 : -0.2;
    group.add(khussa);
  });

  return group;
}

function buildBridalPotliMeshGroup(fabricMat, trimMat, hardwareMat) {
  const group = new THREE.Group();

  // Gathered rounded Potli pouch via LatheGeometry
  const pts = [
    new THREE.Vector2(0.0, -0.45),
    new THREE.Vector2(0.32, -0.42),
    new THREE.Vector2(0.52, -0.18),
    new THREE.Vector2(0.48, 0.12),
    new THREE.Vector2(0.22, 0.34),
    new THREE.Vector2(0.34, 0.56),
    new THREE.Vector2(0.28, 0.58)
  ];
  const pouchGeo = new THREE.LatheGeometry(pts, 40);
  const pouch = new THREE.Mesh(pouchGeo, fabricMat);
  group.add(pouch);

  // Gold drawstring cinch ring + hanging tassels
  const cinch = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.018, 12, 36), hardwareMat);
  cinch.rotation.x = Math.PI / 2;
  cinch.position.y = 0.34;
  group.add(cinch);

  [-0.14, 0.14].forEach((x) => {
    const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.16, 16), hardwareMat);
    tassel.position.set(x, 0.18, 0.24);
    group.add(tassel);
  });

  // Pearl beaded handle arch
  const pearlCount = 18;
  for (let i = 0; i <= pearlCount; i++) {
    const ang = (i / pearlCount) * Math.PI;
    const px = Math.cos(ang) * 0.32;
    const py = 0.55 + Math.sin(ang) * 0.36;
    const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.03, 14, 14), trimMat);
    pearl.position.set(px, py, 0);
    group.add(pearl);
  }

  return group;
}

function buildBlazerCoordMeshGroup(fabricMat, trimMat, hardwareMat) {
  const group = new THREE.Group();

  // Tailored structured blazer jacket
  const blazerGeo = createTailoredPatchGeometry({
    thetaStart: -Math.PI,
    thetaEnd: Math.PI,
    uSteps: 84,
    vSteps: 32,
    yMinFn: () => -0.22,
    yMaxFn: (th) => 0.88 - 0.14 * gaussian(angleDiff(th, 0), 0, 0.2),
    offset: 0.042
  });
  group.add(new THREE.Mesh(blazerGeo, fabricMat));

  // Crisp lapel trim & metallic blazer buttons
  const lapel = new THREE.Mesh(
    createTrimRibbon(-0.65, 0.65, (th) => 0.82 - 0.36 * Math.exp(-th * th * 6), 0.048, 0.012),
    trimMat
  );
  group.add(lapel);

  [0.24, 0.06, -0.1].forEach((yPos) => {
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.01, 18), hardwareMat);
    btn.rotation.x = Math.PI / 2;
    btn.position.copy(sampleBodyPoint(0.08, yPos, 0.052));
    group.add(btn);
  });

  // Tailored wide-leg Zara-style trousers
  [-0.2, 0.2].forEach((xOffset) => {
    const legGeo = new THREE.CylinderGeometry(0.18, 0.24, 1.02, 28, 8, true);
    const leg = new THREE.Mesh(legGeo, trimMat);
    leg.position.set(xOffset, -0.72, 0);
    group.add(leg);
  });

  return group;
}

function buildShawlDrapeMeshGroup(fabricMat, trimMat, hardwareMat) {
  const group = new THREE.Group();

  // Flowing sculpted Pashmina / Velvet Shawl draped over shoulders and arms
  const shawlGeo = createTailoredPatchGeometry({
    thetaStart: -Math.PI * 0.92,
    thetaEnd: Math.PI * 0.92,
    uSteps: 84,
    vSteps: 34,
    yMinFn: (th) => -0.76 + 0.28 * Math.pow(Math.cos(th * 0.5), 2),
    yMaxFn: (th) => 0.86 - 0.12 * Math.max(0, Math.cos(th)),
    offset: 0.058
  });
  group.add(new THREE.Mesh(shawlGeo, fabricMat));

  // Zari / Embroidered Pallu Gold Border along bottom edge
  const borderRibbon = new THREE.Mesh(
    createTrimRibbon(
      -Math.PI * 0.9,
      Math.PI * 0.9,
      (th) => -0.75 + 0.28 * Math.pow(Math.cos(th * 0.5), 2),
      0.062,
      0.014
    ),
    hardwareMat
  );
  group.add(borderRibbon);

  // Inner soft kurta column beneath shawl
  const underKurta = createTailoredPatchGeometry({
    thetaStart: -Math.PI,
    thetaEnd: Math.PI,
    uSteps: 64,
    vSteps: 26,
    yMinFn: () => -1.02,
    yMaxFn: () => 0.65,
    offset: 0.025
  });
  group.add(new THREE.Mesh(underKurta, trimMat));

  return group;
}

function buildPointedMuleMeshGroup(fabricMat, trimMat, hardwareMat) {
  const group = new THREE.Group();

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.88, 0.94, 0.08, 48),
    new THREE.MeshStandardMaterial({ color: 0xf6f0f4, roughness: 0.45, metalness: 0.06 })
  );
  plinth.position.y = -0.34;
  group.add(plinth);

  [-0.36, 0.36].forEach((xPos, idx) => {
    const mule = new THREE.Group();

    // Sculpted pointed sole
    const soleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.24, -0.44),
      new THREE.Vector3(0, 0.14, -0.15),
      new THREE.Vector3(0, 0.02, 0.15),
      new THREE.Vector3(0, 0.04, 0.56)
    ]);
    const soleGeo = new THREE.TubeGeometry(soleCurve, 28, 0.055, 12, false);
    soleGeo.scale(2.1, 0.32, 1);
    mule.add(new THREE.Mesh(soleGeo, fabricMat));

    // Pointed satin vamp upper
    const vampGeo = new THREE.ConeGeometry(0.14, 0.52, 20);
    vampGeo.rotateX(Math.PI / 2);
    vampGeo.scale(1.0, 0.55, 1.0);
    const vamp = new THREE.Mesh(vampGeo, fabricMat);
    vamp.position.set(0, 0.08, 0.34);
    mule.add(vamp);

    // Sculptural kitten heel
    const heel = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.022, 0.26, 16), hardwareMat);
    heel.position.set(0, 0.11, -0.41);
    mule.add(heel);

    // Metallic chain/buckle ornament on toe vamp
    const buckle = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 10, 24), hardwareMat);
    buckle.rotation.x = Math.PI / 2 - 0.25;
    buckle.position.set(0, 0.125, 0.25);
    mule.add(buckle);

    mule.position.set(xPos, -0.26, 0);
    mule.rotation.y = idx === 0 ? 0.24 : -0.22;
    group.add(mule);
  });

  return group;
}

function createPerfumeLabelTexture(labelText, hardwareHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#fdf8ef';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = hardwareHex || '#c99a3e';
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  const title = (labelText || 'NOOR & SILK').toUpperCase();
  ctx.fillStyle = '#22162b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = title.length > 9 ? 'bold 26px Georgia, serif' : 'bold 34px Georgia, serif';
  ctx.fillText(title, canvas.width / 2, 86);

  ctx.fillStyle = '#8e1632';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('EAU DE PARFUM', canvas.width / 2, 134);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildPerfumeBottleMeshGroup(fabricMat, trimMat, hardwareMat, color, labelText, hardwareHex) {
  const group = new THREE.Group();

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.76, 0.82, 0.08, 48),
    new THREE.MeshStandardMaterial({ color: 0xf9f3ef, roughness: 0.4, metalness: 0.08 })
  );
  plinth.position.y = -0.58;
  group.add(plinth);

  // Outer crystal glass flacon
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.06,
    metalness: 0.02,
    transmission: 0.78,
    thickness: 0.35,
    ior: 1.52,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.92
  });

  const bottleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.32, 0.88, 12), glassMat);
  bottleBody.scale.set(1.1, 1, 0.72);
  bottleBody.position.y = -0.08;
  group.add(bottleBody);

  // Inner luminous perfume essence liquid
  const essenceMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color.hex),
    roughness: 0.12,
    metalness: 0.05,
    sheen: 1.0,
    sheenColor: new THREE.Color(color.sheen),
    iridescence: 0.5,
    transparent: true,
    opacity: 0.86
  });
  const essence = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.25, 0.68, 12), essenceMat);
  essence.scale.set(1.08, 1, 0.68);
  essence.position.y = -0.13;
  group.add(essence);

  // Printed perfume name label plaque on front
  const labelTex = createPerfumeLabelTexture(labelText, hardwareHex);
  const labelMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    roughness: 0.3,
    metalness: 0.1
  });
  const plaqueBack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.026), hardwareMat);
  plaqueBack.position.set(0, -0.05, 0.252);
  group.add(plaqueBack);

  const plaqueFace = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.32), labelMat);
  plaqueFace.position.set(0, -0.05, 0.268);
  group.add(plaqueFace);

  // Gold atomizer collar & faceted jewel cap
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.14, 24), hardwareMat);
  collar.position.y = 0.42;
  group.add(collar);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.28, 8), hardwareMat);
  cap.position.y = 0.63;
  group.add(cap);

  return group;
}

function buildShirtTopMeshGroup(fabricMat, trimMat, hardwareMat) {
  const group = new THREE.Group();

  // Tailored crisp shirt torso
  const shirtGeo = createTailoredPatchGeometry({
    thetaStart: -Math.PI,
    thetaEnd: Math.PI,
    uSteps: 84,
    vSteps: 34,
    yMinFn: (th) => -0.22 + 0.06 * Math.cos(th * 2),
    yMaxFn: (th) => 0.92 - 0.1 * gaussian(angleDiff(th, 0), 0, 0.22),
    offset: 0.036
  });
  group.add(new THREE.Mesh(shirtGeo, fabricMat));

  // Tailored shirt collar
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.028, 12, 32), trimMat);
  collar.rotation.x = Math.PI / 2 + 0.14;
  collar.position.set(0, 0.94, 0.02);
  group.add(collar);

  // Sleeves angled gently down
  [-1, 1].forEach((side) => {
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.085, 0.54, 22), fabricMat);
    sleeve.position.set(side * 0.56, 0.56, 0.01);
    sleeve.rotation.z = side * 0.48;
    group.add(sleeve);

    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.092, 0.092, 0.07, 22), trimMat);
    cuff.position.set(side * 0.68, 0.31, 0.01);
    cuff.rotation.z = side * 0.48;
    group.add(cuff);
  });

  // Front button placket & pearl/gold buttons
  for (let y = 0.72; y >= -0.08; y -= 0.16) {
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.01, 16), hardwareMat);
    btn.rotation.x = Math.PI / 2;
    btn.position.copy(sampleBodyPoint(0, y, 0.044));
    group.add(btn);
  }

  return group;
}

function buildBaggyTrousersMeshGroup(fabricMat, trimMat, hardwareMat) {
  const group = new THREE.Group();

  // High-waisted tailored waistband
  const waistBand = createTailoredPatchGeometry({
    thetaStart: -Math.PI,
    thetaEnd: Math.PI,
    uSteps: 72,
    vSteps: 10,
    yMinFn: () => -0.18,
    yMaxFn: () => 0.02,
    offset: 0.032
  });
  group.add(new THREE.Mesh(waistBand, trimMat));

  // Front waist belt buckle
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.02), hardwareMat);
  buckle.position.copy(sampleBodyPoint(0, -0.07, 0.042));
  group.add(buckle);

  // Relaxed baggy wide-leg trouser legs
  [-0.22, 0.22].forEach((xOffset) => {
    const legGeo = new THREE.CylinderGeometry(0.21, 0.29, 1.06, 32, 10, true);
    const leg = new THREE.Mesh(legGeo, fabricMat);
    leg.position.set(xOffset, -0.68, 0);
    group.add(leg);

    const cuffHem = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.012, 10, 36), trimMat);
    cuffHem.rotation.x = Math.PI / 2;
    cuffHem.position.set(xOffset, -1.2, 0);
    group.add(cuffHem);
  });

  return group;
}

function buildSneakerShoeMeshGroup(fabricMat, trimMat, hardwareMat) {
  const group = new THREE.Group();

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.96, 0.08, 48),
    new THREE.MeshStandardMaterial({ color: 0xf4f4f6, roughness: 0.45, metalness: 0.05 })
  );
  plinth.position.y = -0.34;
  group.add(plinth);

  const soleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });

  [-0.36, 0.36].forEach((xPos, idx) => {
    const snk = new THREE.Group();

    // Chunky platform sole
    const soleGeo = new THREE.CapsuleGeometry(0.16, 0.56, 12, 24);
    soleGeo.rotateX(Math.PI / 2);
    soleGeo.scale(1.08, 0.42, 1.0);
    const sole = new THREE.Mesh(soleGeo, soleMat);
    snk.add(sole);

    // Sculpted sneaker upper body
    const upperGeo = new THREE.CapsuleGeometry(0.145, 0.42, 12, 24);
    upperGeo.rotateX(Math.PI / 2);
    upperGeo.scale(0.98, 0.68, 1.0);
    const upper = new THREE.Mesh(upperGeo, fabricMat);
    upper.position.set(0, 0.09, -0.02);
    snk.add(upper);

    // Metallic heel accent & lace bars
    const heelTab = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.11, 0.06), hardwareMat);
    heelTab.position.set(0, 0.16, -0.32);
    snk.add(heelTab);

    for (let z = 0.02; z <= 0.22; z += 0.065) {
      const lace = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 10), trimMat);
      lace.rotation.z = Math.PI / 2;
      lace.position.set(0, 0.175, z);
      snk.add(lace);
    }

    snk.position.set(xPos, -0.22, 0);
    snk.rotation.y = idx === 0 ? 0.24 : -0.22;
    group.add(snk);
  });

  return group;
}

function buildJhumkaEarringsMeshGroup(fabricMat, trimMat, hardwareMat, color) {
  const group = new THREE.Group();

  // Velvet jewelry stand base + brass T-bar
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.62, 0.08, 40),
    new THREE.MeshStandardMaterial({ color: 0xf7eef4, roughness: 0.45 })
  );
  base.position.y = -0.68;
  group.add(base);

  const standPost = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 1.25, 16), hardwareMat);
  standPost.position.y = -0.06;
  group.add(standPost);

  const tBar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.96, 16), hardwareMat);
  tBar.rotation.z = Math.PI / 2;
  tBar.position.y = 0.56;
  group.add(tBar);

  const gemMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color.hex),
    roughness: 0.12,
    metalness: 0.15,
    iridescence: 0.6,
    clearcoat: 1.0
  });
  const pearlMat = new THREE.MeshPhysicalMaterial({
    color: 0xfff8f2,
    roughness: 0.18,
    iridescence: 0.5,
    clearcoat: 0.8
  });

  [-0.32, 0.32].forEach((xPos) => {
    const ear = new THREE.Group();

    // Top gemstone stud
    const stud = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 1), gemMat);
    stud.position.y = 0.44;
    ear.add(stud);

    // Chandbali crescent ring
    const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.022, 12, 32, Math.PI * 1.35), hardwareMat);
    crescent.rotation.z = Math.PI * 0.82;
    crescent.position.y = 0.26;
    ear.add(crescent);

    // Traditional dome Jhumka bell
    const dome = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.24, 24, 1, true), hardwareMat);
    dome.position.y = 0.02;
    ear.add(dome);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 10, 28), gemMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.1;
    ear.add(rim);

    // Hanging pearl droplets around jhumka bell
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const drop = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 12), pearlMat);
      drop.position.set(Math.cos(a) * 0.15, -0.15, Math.sin(a) * 0.15);
      ear.add(drop);
    }

    ear.position.set(xPos, 0.04, 0.04);
    group.add(ear);
  });

  return group;
}

function buildHoopEarringsMeshGroup(fabricMat, trimMat, hardwareMat) {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.52, 0.58, 0.08, 40),
    new THREE.MeshStandardMaterial({ color: 0xf9f3ef, roughness: 0.45 })
  );
  base.position.y = -0.64;
  group.add(base);

  const standPost = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.026, 1.18, 16), hardwareMat);
  standPost.position.y = -0.05;
  group.add(standPost);

  const tBar = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.88, 16), hardwareMat);
  tBar.rotation.z = Math.PI / 2;
  tBar.position.y = 0.52;
  group.add(tBar);

  const pearlMat = new THREE.MeshPhysicalMaterial({
    color: 0xfffaf6,
    roughness: 0.15,
    iridescence: 0.55,
    clearcoat: 0.9
  });

  [-0.28, 0.28].forEach((xPos) => {
    const hoop = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.028, 16, 40), hardwareMat);
    ring.position.y = 0.24;
    hoop.add(ring);

    const dropPearl = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 24), pearlMat);
    dropPearl.scale.set(0.9, 1.2, 0.9);
    dropPearl.position.y = -0.02;
    hoop.add(dropPearl);

    hoop.position.set(xPos, 0.04, 0.03);
    group.add(hoop);
  });

  return group;
}

/**
 * Reusable interactive 3D viewport controller (used for both Hero Stage and Full Atelier Studio).
 */
export class GarmentViewport {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.compact = options.compact ?? false;
    this.autoRotate = options.autoRotate ?? true;
    this.showMannequin = options.showMannequin ?? true;
    this.showWireframe = false;
    this.motionPhase = options.motionPhase ?? 0;
    this.spinVelocity = 0;

    this.scene = new THREE.Scene();

    const width = canvas.clientWidth || canvas.width || (this.compact ? 220 : 600);
    const height = canvas.clientHeight || canvas.height || (this.compact ? 220 : 560);
    this.camera = new THREE.PerspectiveCamera(this.compact ? 36 : 34, width / height, 0.1, 40);
    this.camera.position.set(1.25, 0.28, this.compact ? 2.85 : 3.05);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.compact ? 1.5 : 2));
    this.renderer.setSize(width, height, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = !this.compact;
    if (!this.compact) {
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enableZoom = !this.compact;
    this.controls.enablePan = false;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 5.2;
    this.controls.maxPolarAngle = Math.PI * 0.72;
    this.controls.minPolarAngle = Math.PI * 0.22;
    this.controls.target.set(0, 0.12, 0);
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = options.autoRotateSpeed ?? (this.compact ? 2.4 : 1.1);

    this.rootGroup = new THREE.Group();
    this.scene.add(this.rootGroup);

    this.garmentGroup = new THREE.Group();
    this.rootGroup.add(this.garmentGroup);

    this.mannequinGroup = buildMannequinGroup();
    this.mannequinGroup.visible = this.showMannequin;
    this.rootGroup.add(this.mannequinGroup);

    // Soft studio shadow catcher disc
    const shadowPlane = new THREE.Mesh(
      new THREE.CircleGeometry(1.4, 48),
      new THREE.ShadowMaterial({ opacity: 0.12 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.705;
    shadowPlane.receiveShadow = true;
    this.rootGroup.add(shadowPlane);

    this.setupLights();
    this.setLightingPreset('atelier');

    this.cameraTargetPos = null;
    this.cameraTargetLook = null;

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    if (canvas.parentElement) {
      this.resizeObserver.observe(canvas.parentElement);
    }

    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    this.rafId = requestAnimationFrame(this.animate);
  }

  setupLights() {
    this.hemiLight = new THREE.HemisphereLight(0xfffaf4, 0xd8c8b8, 0.95);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight(0xfff4e8, 2.0);
    this.keyLight.position.set(2.8, 3.6, 3.2);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(1024, 1024);
    this.keyLight.shadow.bias = -0.0005;
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0xf3dfd7, 0.85);
    this.fillLight.position.set(-3.0, 1.4, 2.2);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight(0xffe7d1, 1.1);
    this.rimLight.position.set(0.2, 2.2, -3.4);
    this.scene.add(this.rimLight);
  }

  setLightingPreset(preset) {
    if (preset === 'daylight') {
      this.hemiLight.color.setHex(0xffffff);
      this.hemiLight.intensity = 1.15;
      this.keyLight.color.setHex(0xf9fcff);
      this.keyLight.intensity = 1.85;
      this.fillLight.color.setHex(0xe8eff5);
      this.rimLight.color.setHex(0xffffff);
      this.renderer.toneMappingExposure = 1.1;
    } else if (preset === 'evening') {
      this.hemiLight.color.setHex(0xe6d5c8);
      this.hemiLight.intensity = 0.65;
      this.keyLight.color.setHex(0xffd7b3);
      this.keyLight.intensity = 2.25;
      this.fillLight.color.setHex(0xb88b84);
      this.rimLight.color.setHex(0xffc99e);
      this.renderer.toneMappingExposure = 0.98;
    } else {
      // Warm Atelier default
      this.hemiLight.color.setHex(0xfffaf4);
      this.hemiLight.intensity = 0.95;
      this.keyLight.color.setHex(0xfff4e8);
      this.keyLight.intensity = 2.0;
      this.fillLight.color.setHex(0xf3dfd7);
      this.rimLight.color.setHex(0xffe7d1);
      this.renderer.toneMappingExposure = 1.08;
    }
  }

  setCameraPreset(preset) {
    if (preset === 'front') {
      this.cameraTargetPos = new THREE.Vector3(0, 0.24, 3.05);
      this.cameraTargetLook = new THREE.Vector3(0, 0.15, 0);
    } else if (preset === 'back') {
      this.cameraTargetPos = new THREE.Vector3(0.35, 0.28, -2.95);
      this.cameraTargetLook = new THREE.Vector3(0, 0.18, 0);
    } else if (preset === 'closeup') {
      this.cameraTargetPos = new THREE.Vector3(0.48, 0.42, 1.72);
      this.cameraTargetLook = new THREE.Vector3(0, 0.34, 0.12);
    } else {
      // threeQuarter
      this.cameraTargetPos = new THREE.Vector3(1.25, 0.28, 3.05);
      this.cameraTargetLook = new THREE.Vector3(0, 0.12, 0);
    }
  }

  setAutoRotate(enabled) {
    this.autoRotate = enabled;
    this.controls.autoRotate = enabled;
  }

  setMannequinVisible(visible) {
    this.showMannequin = visible;
    this.mannequinGroup.visible = visible;
  }

  setWireframe(enabled) {
    this.showWireframe = enabled;
    this.garmentGroup.traverse((obj) => {
      if (obj.isMesh && obj.material && !obj.userData.isHardware) {
        obj.material.wireframe = enabled;
      }
    });
  }

  renderGarment({ modelType, color, fabric, hardware, labelText = '', animateTransition = false }) {
    // Clear previous garment meshes
    while (this.garmentGroup.children.length > 0) {
      const child = this.garmentGroup.children[0];
      this.garmentGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
    }

    if (animateTransition) {
      this.spinVelocity = 0.18;
      this.rootGroup.scale.set(0.88, 0.88, 0.88);
    }

    const { bumpMap, alphaMap } = getFabricTextures(fabric.pattern);

    const fabricMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color.hex),
      roughness: fabric.roughness,
      metalness: fabric.metalness,
      sheen: fabric.sheen,
      sheenColor: new THREE.Color(color.sheen),
      sheenRoughness: fabric.sheenRoughness,
      iridescence: fabric.iridescence ?? 0.25,
      iridescenceIOR: 1.32,
      clearcoat: fabric.pattern === 'silk' ? 0.28 : 0.04,
      clearcoatRoughness: 0.26,
      bumpMap,
      bumpScale: fabric.pattern === 'lace' ? 0.015 : fabric.pattern === 'rib' ? 0.008 : 0.004,
      transparent: fabric.opacity < 1 || fabric.pattern === 'lace' || fabric.pattern === 'mesh',
      opacity: fabric.opacity,
      alphaMap: fabric.pattern === 'lace' || fabric.pattern === 'mesh' ? alphaMap : null,
      side: THREE.DoubleSide,
      wireframe: this.showWireframe
    });

    const trimColor = new THREE.Color(color.hex).lerp(new THREE.Color(color.sheen), 0.18);
    const trimMat = new THREE.MeshPhysicalMaterial({
      color: trimColor,
      roughness: Math.min(0.75, fabric.roughness + 0.1),
      sheen: 0.85,
      sheenColor: new THREE.Color(color.sheen),
      iridescence: 0.22,
      side: THREE.DoubleSide,
      wireframe: this.showWireframe
    });

    const hardwareMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hardware.hex),
      roughness: 0.24,
      metalness: 0.9
    });

    const nonBodyModels = new Set([
      'bridal-sandal',
      'bridal-khussa',
      'bridal-potli',
      'pointed-mule',
      'perfume-bottle',
      'sneaker-shoe',
      'earrings-jhumka',
      'earrings-hoop'
    ]);
    const isNonBody = nonBodyModels.has(modelType);
    this.mannequinGroup.visible = this.showMannequin && !isNonBody;

    let built;
    if (modelType === 'bralette' || modelType === 'demi-bra') {
      built = buildBraMeshGroup(modelType, fabricMat, trimMat, hardwareMat);
    } else if (modelType === 'high-waist-brief' || modelType === 'lace-panty') {
      built = buildBriefMeshGroup(modelType === 'high-waist-brief', fabricMat, trimMat, hardwareMat);
    } else if (modelType === 'bodysuit') {
      built = buildBodysuitMeshGroup(fabricMat, trimMat, hardwareMat);
    } else if (modelType === 'silk-slip') {
      built = buildSilkSlipMeshGroup(fabricMat, trimMat, hardwareMat);
    } else if (modelType === 'nighty-robe') {
      built = buildNightyRobeMeshGroup(fabricMat, trimMat, hardwareMat);
    } else if (modelType === 'bridal-lehenga') {
      built = buildBridalLehengaMeshGroup(fabricMat, trimMat, hardwareMat);
    } else if (modelType === 'kurta-sharara') {
      built = buildKurtaShararaMeshGroup(fabricMat, trimMat, hardwareMat);
    } else if (modelType === 'blazer-coord') {
      built = buildBlazerCoordMeshGroup(fabricMat, trimMat, hardwareMat);
    } else if (modelType === 'shirt-top') {
      built = buildShirtTopMeshGroup(fabricMat, trimMat, hardwareMat);
    } else if (modelType === 'baggy-trousers') {
      built = buildBaggyTrousersMeshGroup(fabricMat, trimMat, hardwareMat);
    } else if (modelType === 'shawl-drape') {
      built = buildShawlDrapeMeshGroup(fabricMat, trimMat, hardwareMat);
    } else if (modelType === 'bridal-sandal') {
      built = buildBridalSandalMeshGroup(fabricMat, trimMat, hardwareMat);
    } else if (modelType === 'bridal-khussa') {
      built = buildBridalKhussaMeshGroup(fabricMat, trimMat, hardwareMat);
    } else if (modelType === 'pointed-mule') {
      built = buildPointedMuleMeshGroup(fabricMat, trimMat, hardwareMat);
    } else if (modelType === 'sneaker-shoe') {
      built = buildSneakerShoeMeshGroup(fabricMat, trimMat, hardwareMat);
    } else if (modelType === 'bridal-potli') {
      built = buildBridalPotliMeshGroup(fabricMat, trimMat, hardwareMat);
    } else if (modelType === 'earrings-jhumka') {
      built = buildJhumkaEarringsMeshGroup(fabricMat, trimMat, hardwareMat, color);
    } else if (modelType === 'earrings-hoop') {
      built = buildHoopEarringsMeshGroup(fabricMat, trimMat, hardwareMat);
    } else if (modelType === 'perfume-bottle') {
      built = buildPerfumeBottleMeshGroup(fabricMat, trimMat, hardwareMat, color, labelText, hardware.hex);
    } else {
      // balconette-set: combine demi bra + matching brief
      built = new THREE.Group();
      built.add(buildBraMeshGroup('balconette-set', fabricMat, trimMat, hardwareMat));
      built.add(buildBriefMeshGroup(false, fabricMat, trimMat, hardwareMat));
    }

    built.traverse((obj) => {
      if (obj.isMesh && obj.material === hardwareMat) {
        obj.userData.isHardware = true;
      }
    });

    this.garmentGroup.add(built);

    // Center focus gently based on item type
    if (modelType === 'high-waist-brief' || modelType === 'lace-panty' || modelType === 'baggy-trousers') {
      this.controls.target.set(0, -0.45, 0);
    } else if (modelType === 'bralette' || modelType === 'demi-bra' || modelType === 'shirt-top') {
      this.controls.target.set(0, 0.35, 0);
    } else if (isNonBody) {
      this.controls.target.set(0, 0.0, 0);
    } else if (modelType === 'bridal-lehenga' || modelType === 'kurta-sharara') {
      this.controls.target.set(0, -0.22, 0);
    } else {
      this.controls.target.set(0, 0.08, 0);
    }
  }

  handleResize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    if (width === 0 || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  animate() {
    this.rafId = requestAnimationFrame(this.animate);
    const t = this.clock.getElapsedTime();

    // Smooth 3D entrance spin & scale pop
    if (this.spinVelocity > 0.001) {
      this.rootGroup.rotation.y += this.spinVelocity;
      this.spinVelocity *= 0.92;
    }
    if (this.rootGroup.scale.x < 0.999) {
      this.rootGroup.scale.lerp(new THREE.Vector3(1, 1, 1), 0.12);
    }

    // Subtle floating 3D motion in Ghost Mode or compact related 3D cards
    if (!this.showMannequin || this.compact) {
      this.garmentGroup.position.y = Math.sin(t * 1.8 + this.motionPhase) * 0.022;
      if (this.compact) {
        this.rootGroup.rotation.z = Math.sin(t * 1.1 + this.motionPhase) * 0.04;
      }
    } else {
      this.garmentGroup.position.y = 0;
    }

    if (this.cameraTargetPos) {
      this.camera.position.lerp(this.cameraTargetPos, 0.08);
      if (this.cameraTargetLook) {
        this.controls.target.lerp(this.cameraTargetLook, 0.08);
      }
      if (this.camera.position.distanceTo(this.cameraTargetPos) < 0.02) {
        this.cameraTargetPos = null;
        this.cameraTargetLook = null;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this.rafId);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
  }
}

/**
 * Dedicated 3D Aesthetic Showcase Scene for the Member Login Atelier.
 * Renders a floating iridescent silk silhouette encircled by glowing antique-gold orbital rings
 * and floating pearl/gemstone spheres with smooth cursor parallax.
 */
export class AuthPrismScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();

    const width = canvas.clientWidth || 440;
    const height = canvas.clientHeight || 560;
    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 40);
    this.camera.position.set(0.35, 0.2, 3.25);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;

    this.root = new THREE.Group();
    this.scene.add(this.root);

    // Lighting
    this.scene.add(new THREE.HemisphereLight(0xfff5fa, 0x7c3aed, 1.05));
    const key = new THREE.DirectionalLight(0xfff1e0, 2.2);
    key.position.set(2.5, 3.2, 3.0);
    this.scene.add(key);

    this.accentLight = new THREE.PointLight(0xd9266b, 2.6, 8);
    this.accentLight.position.set(-1.6, 0.9, 1.8);
    this.scene.add(this.accentLight);

    const rim = new THREE.DirectionalLight(0xfde68a, 1.4);
    rim.position.set(0.5, 2.0, -3.0);
    this.scene.add(rim);

    // Garment group
    this.garmentHolder = new THREE.Group();
    this.garmentHolder.position.y = -0.05;
    this.root.add(this.garmentHolder);

    // Concentric antique-gold orbital rings
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xe6c37a,
      metalness: 0.92,
      roughness: 0.2
    });
    this.ringOuter = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.012, 16, 80), goldMat);
    this.ringOuter.rotation.set(1.18, 0.25, 0.1);
    this.root.add(this.ringOuter);

    this.ringInner = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.009, 16, 72), goldMat);
    this.ringInner.rotation.set(-0.95, -0.35, 0.4);
    this.root.add(this.ringInner);

    // Floating iridescent pearls & botanical gems
    this.orbs = [];
    const orbConfigs = [
      { r: 0.07, pos: [-0.92, 0.62, 0.35], color: 0xffd1dc },
      { r: 0.055, pos: [0.95, -0.35, 0.42], color: 0xfde68a },
      { r: 0.065, pos: [0.68, 0.78, -0.25], color: 0xd8b4fe },
      { r: 0.048, pos: [-0.72, -0.64, 0.38], color: 0x6ee7b7 },
      { r: 0.04, pos: [0.15, 0.96, 0.45], color: 0xfda4af }
    ];
    orbConfigs.forEach((cfg, idx) => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: cfg.color,
        roughness: 0.14,
        metalness: 0.1,
        iridescence: 0.8,
        clearcoat: 0.9
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(cfg.r, 24, 24), mat);
      mesh.position.set(...cfg.pos);
      this.root.add(mesh);
      this.orbs.push({ mesh, basePos: new THREE.Vector3(...cfg.pos), phase: idx * 1.2 });
    });

    this.setThemeColor('#D9266B', '#FF99C8');

    this.pointer = { x: 0, y: 0 };
    this.onPointerMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      this.pointer.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      this.pointer.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener('pointermove', this.onPointerMove);

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    if (canvas.parentElement) {
      this.resizeObserver.observe(canvas.parentElement);
    }

    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    this.rafId = requestAnimationFrame(this.animate);
  }

  setThemeColor(hex, sheenHex = '#FFE4EC') {
    while (this.garmentHolder.children.length > 0) {
      const child = this.garmentHolder.children[0];
      this.garmentHolder.remove(child);
      if (child.geometry) child.geometry.dispose();
    }

    this.accentLight.color.set(hex);
    const { bumpMap } = getFabricTextures('silk');

    const fabricMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(hex),
      roughness: 0.2,
      metalness: 0.08,
      sheen: 1.0,
      sheenColor: new THREE.Color(sheenHex),
      sheenRoughness: 0.24,
      iridescence: 0.55,
      iridescenceIOR: 1.35,
      clearcoat: 0.32,
      bumpMap,
      bumpScale: 0.005,
      side: THREE.DoubleSide
    });

    const trimMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(hex).lerp(new THREE.Color(sheenHex), 0.22),
      roughness: 0.35,
      sheen: 0.9,
      side: THREE.DoubleSide
    });

    const hardwareMat = new THREE.MeshStandardMaterial({
      color: 0xe6c37a,
      roughness: 0.22,
      metalness: 0.92
    });

    const setGroup = new THREE.Group();
    setGroup.add(buildBraMeshGroup('balconette-set', fabricMat, trimMat, hardwareMat));
    setGroup.add(buildBriefMeshGroup(false, fabricMat, trimMat, hardwareMat));
    setGroup.scale.set(0.9, 0.9, 0.9);
    this.garmentHolder.add(setGroup);
  }

  handleResize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  animate() {
    this.rafId = requestAnimationFrame(this.animate);
    const t = this.clock.getElapsedTime();

    this.garmentHolder.rotation.y = t * 0.55 + this.pointer.x * 0.35;
    this.garmentHolder.position.y = -0.05 + Math.sin(t * 1.6) * 0.035;

    this.ringOuter.rotation.z = t * 0.22;
    this.ringInner.rotation.z = -t * 0.32;

    this.root.rotation.x += (this.pointer.y * 0.14 - this.root.rotation.x) * 0.06;
    this.root.rotation.y += (this.pointer.x * 0.18 - this.root.rotation.y) * 0.06;

    this.orbs.forEach((o) => {
      o.mesh.position.y = o.basePos.y + Math.sin(t * 1.5 + o.phase) * 0.06;
    });

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('pointermove', this.onPointerMove);
    this.resizeObserver.disconnect();
    this.renderer.dispose();
  }
}

/**
 * Shared singleton offscreen Three.js snapshot renderer so dozens of 3D cards can show
 * crisp real-time 3D renders without exhausting browser WebGL contexts.
 */
let sharedSnapshotRenderer = null;

export function renderGarmentSnapshot({ modelType, color, fabric, hardware, labelText = '' }) {
  if (!sharedSnapshotRenderer) {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 560;
    offCanvas.height = 440;
    sharedSnapshotRenderer = new GarmentViewport(offCanvas, {
      autoRotate: false,
      showMannequin: false
    });
    cancelAnimationFrame(sharedSnapshotRenderer.rafId);
  }
  const vp = sharedSnapshotRenderer;
  vp.renderGarment({ modelType, color, fabric, hardware, labelText });
  vp.rootGroup.rotation.y = 0.42;
  vp.camera.position.set(0.95, 0.28, 2.65);
  vp.controls.update();
  vp.renderer.render(vp.scene, vp.camera);
  return vp.canvas.toDataURL('image/png');
}
