import { CARD_CUSTOM_ELEMENT_TAGNAME } from '.'

export const DEFAULT_CONFIG = {
    type: `custom:${CARD_CUSTOM_ELEMENT_TAGNAME}`,
    active_scene: '"primary_scene"',
    styles: `.better-3d__card {
  display: block;
  position: relative;
  width: 100%;
  aspect-ratio: 2/1;
}`,
    scenes: {
        primary_scene: {
            active_camera: '"primary_camera"',
            background_color: 'new color("#eeeeee")',
            objects: {
                primary_camera: {
                    type: 'camera.perspective',
                    fov: '50',
                    near: '0.1',
                    far: '10000',
                    position: 'new vector3(100, 20, 300)',
                    look_at: 'new vector3(0, 0, 0)',
                },
                point_light: {
                    type: 'light.point',
                    position: 'new vector3(0, 0, 0)',
                    intensity: '2000',
                    color: 'new color("#ffffff")',
                    visible: 'true',
                },
                ambient_light: {
                    type: 'light.ambient',
                    intensity: '1',
                    color: 'new color("#ffffff")',
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
                    size: 'new htmlsize("auto", "auto")',
                    position: 'new vector3(0, 0, 0)',
                    rotation: 'new euler(0, 0, 0)',
                    scale: 'new vector3(1, 1, 1)',
                    visible: 'true',
                },
            },
        },
    },
}
