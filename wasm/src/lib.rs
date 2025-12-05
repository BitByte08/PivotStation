use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Pivot {
    pub id: String,
    #[serde(rename = "type")]
    pub type_: String, // "joint" or "fixed"
    pub x: f64,
    pub y: f64,
    pub children: Vec<Pivot>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Figure {
    pub id: String,
    pub root_pivot: Pivot,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Frame {
    pub id: String,
    pub figures: Vec<Figure>,
}

#[wasm_bindgen]
pub fn interpolate_frame(frame_a: JsValue, frame_b: JsValue, t: f64) -> JsValue {
    let a: Frame = serde_wasm_bindgen::from_value(frame_a).unwrap();
    let b: Frame = serde_wasm_bindgen::from_value(frame_b).unwrap();
    
    let interpolated = interpolate_frame_internal(&a, &b, t);
    serde_wasm_bindgen::to_value(&interpolated).unwrap()
}

fn interpolate_frame_internal(a: &Frame, b: &Frame, t: f64) -> Frame {
    let mut figures = Vec::new();
    
    for fig_a in &a.figures {
        if let Some(fig_b) = b.figures.iter().find(|f| f.id == fig_a.id) {
            figures.push(interpolate_figure(fig_a, fig_b, t));
        } else {
            // If figure missing in B, keep A (or handle disappearance)
            figures.push(fig_a.clone());
        }
    }
    
    Frame {
        id: format!("{}-interpolated", a.id),
        figures,
    }
}

fn interpolate_figure(a: &Figure, b: &Figure, t: f64) -> Figure {
    Figure {
        id: a.id.clone(),
        root_pivot: interpolate_pivot(&a.root_pivot, &b.root_pivot, t),
    }
}

fn interpolate_pivot(a: &Pivot, b: &Pivot, t: f64) -> Pivot {
    let x = a.x + (b.x - a.x) * t;
    let y = a.y + (b.y - a.y) * t;
    
    let mut children = Vec::new();
    for child_a in &a.children {
        if let Some(child_b) = b.children.iter().find(|c| c.id == child_a.id) {
            children.push(interpolate_pivot(child_a, child_b, t));
        } else {
            children.push(child_a.clone());
        }
    }
    
    Pivot {
        id: a.id.clone(),
        type_: a.type_.clone(),
        x,
        y,
        children,
    }
}
