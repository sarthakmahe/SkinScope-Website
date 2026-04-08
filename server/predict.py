
import json
import os
import sys

import torch
import torchvision.models as models
import torchvision.transforms as transforms
import torchvision.transforms.functional as F_pil # type: ignore
from PIL import Image

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Single high-quality resize (match training if you used 224 square; adjust if training differed)
try:
    _resize = transforms.Resize((224, 224), interpolation=transforms.InterpolationMode.BILINEAR, antialias=True)
except TypeError:
    _resize = transforms.Resize((224, 224))

transform = transforms.Compose([
    _resize,
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

model = models.resnet50(weights=None)

num_classes = 10
model.fc = torch.nn.Linear(model.fc.in_features, num_classes)

model_path = os.path.join(SCRIPT_DIR, 'model', 'resnet50_custom.pth')
try:
    _state = torch.load(model_path, map_location=torch.device('cpu'), weights_only=True)
except TypeError:
    _state = torch.load(model_path, map_location=torch.device('cpu'))
model.load_state_dict(_state)
model.eval()

# Class order must match the training label mapping (folder order / ImageFolder idx).
labels = ["Normal", "acne", "bullous", "chickenpox", "dermatitis",
          "eczema", "hives", "measles", "monkeypox", "psoriasis"]


def _tensor_batch(pil_image):
    """Original + horizontal flip — test-time augmentation; averages logits."""
    t = transform(pil_image)
    t_flip = F_pil.hflip(pil_image)
    t_flip = transform(t_flip)
    return torch.stack([t, t_flip], dim=0)


def predict(image_path):
    try:
        image = Image.open(image_path).convert("RGB")
        batch = _tensor_batch(image)

        with torch.no_grad():
            logits = model(batch)
            # Average logits from TTA views, then softmax
            avg_logits = logits.mean(dim=0)
            probabilities = torch.nn.functional.softmax(avg_logits, dim=0)

        probs = probabilities.cpu().tolist()
        top_idx = sorted(range(len(probs)), key=lambda i: probs[i], reverse=True)[:3]
        predicted = top_idx[0]

        top3 = [{"label": labels[i], "probability": round(probs[i], 4)} for i in top_idx]

        return {
            "label": labels[predicted],
            "confidence": round(probs[predicted], 4),
            "top3": top3,
        }
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    image_path = sys.argv[1]
    result = predict(image_path)
    print(json.dumps(result))

    