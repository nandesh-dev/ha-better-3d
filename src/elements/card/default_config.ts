import { CARD_CUSTOM_ELEMENT_TAGNAME } from '.'

export const DEFAULT_CONFIG = {
    type: `custom:${CARD_CUSTOM_ELEMENT_TAGNAME}`,
    active_scene: '"primary_scene"',
    styles: `.card {
  position: relative;
  width: 100%;
  aspect-ratio: 2/1;
}

.visual {
  position: relative;
  width: 100%;
  height: 100%;
}

.visual__renderer {
  width: 100%;
  height: 100%;
}

.visual__error {
  position: absolute;
  inset: 0;
  overflow-y: scroll;
  white-space: pre;
  color: var(--primary-text-color);
}`,
    scenes: {
        primary_scene: {
            active_camera: '"primary_camera"',
            background_color: 'new Color("#eeeeee")',
            cameras: {
                primary_camera: {
                    type: 'orbital.perspective',
                    fov: '50',
                    near: '0.1',
                    far: '10000',
                    position: 'new Vector3(100, 20, 300)',
                    look_at: 'new Vector3(0, 0, 0)',
                },
            },
            objects: {
                point_light: {
                    type: 'light.point',
                    position: 'new Vector3(0, 0, 0)',
                    intensity: '2000',
                    color: 'new Color("#ffffff")',
                    visible: 'true',
                },
                ambient_light: {
                    type: 'light.ambient',
                    intensity: '1',
                    color: 'new Color("#ffffff")',
                    visible: 'true',
                },
                logo: {
                    type: 'card.3d',
                    config: {
                        type: 'picture',
                        image: 'https://raw.githubusercontent.com/nandesh-dev/ha-better-3d/main/assets/favicon.png',
                        card_mod: {
                            style: `ha-card {
  background: none !important;
  box-shadow: none;
}`,
                        },
                    },
                    size: 'new HTMLSize("auto", "auto")',
                    position: 'new Vector3(0, 0, 0)',
                    rotation: 'new Euler(0, 0, 0)',
                    scale: 'new Vector3(1, 1, 1)',
                    visible: 'true',
                },
            },
        },
    },
}
