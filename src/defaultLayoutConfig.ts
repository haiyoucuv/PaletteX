export const defaultLayoutConfig = {
    "type": "BoxLayoutContainer",
    "isVertical": false,
    "bounds": {
        "x": 0,
        "y": 0,
        "width": 994,
        "height": 983
    },
    "firstElement": {
        "type": "BoxLayoutElement",
        "bounds": {
            "x": 0,
            "y": 0,
            "width": 67.5,
            "height": 983
        },
        "render": {
            "selectedIndex": 0,
            "panels": [
                "ToolbarPanel"
            ]
        }
    },
    "secondElement": {
        "type": "BoxLayoutContainer",
        "isVertical": false,
        "bounds": {
            "x": 68.5,
            "y": 0,
            "width": 925.5,
            "height": 983
        },
        "firstElement": {
            "type": "BoxLayoutElement",
            "bounds": {
                "x": 68.5,
                "y": 0,
                "width": 654.75,
                "height": 983
            },
            "render": {
                "selectedIndex": 0,
                "panels": [
                    "CanvasPanel"
                ]
            }
        },
        "secondElement": {
            "type": "BoxLayoutElement",
            "bounds": {
                "x": 724.25,
                "y": 0,
                "width": 269.75,
                "height": 983
            },
            "render": {
                "selectedIndex": 0,
                "panels": [
                    "LayerPanelPanel"
                ]
            }
        }
    }
}
