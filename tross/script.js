const albumArt = 'https://raw.githubusercontent.com/CEPBEP/cepbep.github.io/master/media/img/IMG_20201216_030319_713.jpg';

class App {
  constructor() {
    this._bg = 0xa9a89b;

    this._bind('_render', '_resize');
    this._setup();
    this._createScene();

    window.addEventListener('resize', this._resize);
  }

  _bind(...methods) {
    methods.forEach(method => this[method] = this[method].bind(this));
  }

  _setup() {
    const renderer = this._renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    const scene = this._scene = new THREE.Scene();
    scene.fog = new THREE.Fog(this._bg, 100, 190);

    const camera = this._camera = new MovePerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000);

    camera.position.set(0, 0, 120);
  }

  _createScene() {
    const scene = this._scene;

    const light = new THREE.PointLight(0xffffff);
    light.position.set(100, 100, 200);
    scene.add(light);

    const frags = this._frags = new FragmentPlanes(albumArt);
    scene.add(frags);
  }

  _render() {
    const camera = this._camera;
    const frags = this._frags;
    const renderer = this._renderer;
    const scene = this._scene;

    renderer.render(scene, camera);

    camera._update();
    frags._update();

    requestAnimationFrame(this._render);
  }

  _resize(e) {
    const renderer = this._renderer;
    const camera = this._camera;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }}


class FragmentPlanes extends THREE.Object3D {
  constructor(url) {
    super();

    this._handleMove = this._handleMove.bind(this);
    this._moveX = 0;
    this._moveY = 0;
    this._targetRotation = new THREE.Quaternion();

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('');

    loader.load(url, t => {
      const material = new THREE.MeshLambertMaterial({ map: t });
      const main = this._main = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), material);
      main.position.set(0, 0, 2);
      const fragments = this._fragments = Array(40).fill().map((e, i) => {
        let h, w;
        if (i % 4 === 2 || i % 4 === 1) {
          w = this._random(3, 0.1);
          h = w;
        } else {
          w = this._random(3, 0.1) * (i % 2 ? 1 : 8);
          h = this._random(3, 0.1) * (!(i % 2) ? 1 : 8);
        }
        const rectLength = Math.max(h, w);
        const scaler = 28 / rectLength * 2;
        const fragTex = t.clone();
        fragTex.needsUpdate = true;

        if (h > w) {
          const repeatX = w / h;
          fragTex.wrapS = THREE.ClampToEdgeWrapping;
          fragTex.wrapT = THREE.RepeatWrapping;
          fragTex.repeat.set(repeatX / scaler, 1 / scaler);
          fragTex.offset.x = 0.5 * (1 - fragTex.repeat.x * this._random(-20, 20));
        } else {
          const repeatY = h / w;
          fragTex.wrapT = THREE.ClampToEdgeWrapping;
          fragTex.wrapS = THREE.RepeatWrapping;
          fragTex.repeat.set(1 / scaler, repeatY / scaler);
          fragTex.offset.y = 0.5 * (1 - fragTex.repeat.y * this._random(-20, 20));
        }

        const fragMat = new THREE.MeshLambertMaterial({ map: fragTex });
        return new THREE.Mesh(new THREE.PlaneGeometry(w, h), fragMat);
      });
      fragments.forEach((frag, i) => {
        frag.position.set(this._random(60, -60), this._random(60, -60), this._random(5, -5) * 10);
        this.add(frag);
      });
      this.add(main);
    });

    document.addEventListener('mousemove', this._handleMove, false);
    document.addEventListener('touchmove', this._handleMove, false);
    document.addEventListener('touchstart', this._handleMove, false);
  }

  _handleMove(e) {
    const action = {};
    if (e.type === 'touchmove' || e.type === 'touchstart') {
      action.x = e.touches[0].clientX;
      action.y = e.touches[0].clientY;
    } else {
      e.preventDefault();
      action.x = e.clientX;
      action.y = e.clientY;
    }

    const halfWidth = window.innerWidth / 2;
    const halfHeight = window.innerHeight / 2;
    const x = this._moveX = (action.x - halfWidth) / halfWidth;
    const y = this._moveY = (-action.y + halfHeight) / halfHeight;
    const radius = (x ** 2 + y ** 2) ** 0.5;

    const q = this._targetRotation;
    q.setFromAxisAngle(
    new THREE.Vector3(-y, x, 0),
    Math.PI / 4 * radius * 0.8);

    q.normalize();
  }

  _update() {
    const curQuaternion = this.quaternion;
    if (!curQuaternion.equals(this._targetRotation)) {
      curQuaternion.slerp(this._targetRotation, 0.04);
      curQuaternion.normalize();
      this.setRotationFromQuaternion(curQuaternion);
    }
  }

  _random(min, max) {
    return Math.ceil(Math.random() * (max - min) + min || this._random(min, max));
  }}
;

class MovePerspectiveCamera extends THREE.PerspectiveCamera {
  constructor(...args) {
    super(...args);

    this._handleMove = this._handleMove.bind(this);

    this._moveX = 0;
    this._moveY = 0;

    document.addEventListener('mousemove', this._handleMove, false);
    document.addEventListener('touchmove', this._handleMove, false);
    document.addEventListener('touchstart', this._handleMove, false);
  }

  _handleMove(e) {
    const action = {};
    if (e.type === 'touchmove' || e.type === 'touchstart') {
      action.x = e.touches[0].clientX;
      action.y = e.touches[0].clientY;
    } else {
      e.preventDefault();
      action.x = e.clientX;
      action.y = e.clientY;
    }

    this._moveX = (action.x - window.innerWidth / 2) * 0.01;
    this._moveY = (action.y - window.innerHeight / 2) * 0.01;
  }

  _update() {
    this.position.x += (this._moveX - this.position.x) * 0.015;
    this.position.y += (-this._moveY - this.position.y) * 0.015;
  }}


document.addEventListener('DOMContentLoaded', function () {
  var app = new App();
  app._render();
});