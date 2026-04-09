import os
from pathlib import Path

# Get the directory where this config.py file is located
BASE_DIR = Path(__file__).resolve().parent.parent  # backend_new/

IMG_SIZE = (224, 224)          # Input size expected by EfficientNet-B0
MODEL_PATH = str(BASE_DIR / "models" / "crop_health_model.h5")

# Every class the model can predict (order must match training labels)
CLASS_NAMES = [
    "Maize_Common_Rust",
    "Maize_Gray_Leaf_Spot",
    "Maize_Healthy",
    "Maize_Northern_Leaf_Blight",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites_Two_spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]

# Treatment advice keyed by class name (Ethiopian cultural context)
TREATMENT_ADVICE: dict[str, str] = {
    "Maize_Common_Rust": (
        "የበሰበሰ በሽታ (Common Rust): በአዞክሲስትሮቢን ወይም ፕሮፒኮናዞል መድሃኒት ይረጩ። "
        "የተከላካይ ዝርያዎችን ይዝሩ እና ለአየር ዝውውር በቂ ቦታ ይተው። "
        "Traditional: Mix neem leaves (ኒም) with water and spray on affected plants."
    ),
    "Maize_Gray_Leaf_Spot": (
        "ግራጫ ቅጠል ነጠብጣብ: ፈንገስ ገዳይ መድሃኒት (ስትሮቢሉሪን) ይጠቀሙ። የሰብል ማዞሪያ ያድርጉ። "
        "የተበከሉ ቅጠሎችን ያስወግዱ እና ያቃጥሉ። "
        "Ethiopian practice: Rotate with teff or pulses to break disease cycle."
    ),
    "Maize_Northern_Leaf_Blight": (
        "የሰሜን ቅጠል ማቃጠያ: ምልክቶች ሲታዩ ፈንገስ ገዳይ መድሃኒት ይረጩ። የተከላካይ ዝርያዎችን ይጠቀሙ। "
        "ከመሰብሰብ በኋላ የተበከሉ እፅዋትን ያስወግዱ። "
        "Local wisdom: Plant marigold (ጽጌረዳ) around fields as natural pest deterrent."
    ),
    "Potato_Early_Blight": (
        "የድንች ቀደምት ማቃጠያ: ማንኮዜብ ወይም የመዳብ ኦክሲክሎራይድ በየ7-10 ቀናት ይረጩ። "
        "ከላይ ውሃ መስጠትን ያስወግዱ። የታችኛውን የተበከለ ቅጠል ያስወግዱ። "
        "Ethiopian tip: Use wood ash (አመድ) mixed with water as organic fungicide."
    ),
    "Potato_Late_Blight": (
        "የድንች ዘግይቶ ማቃጠያ: ክሎሮታሎኒል ወይም የመዳብ መድሃኒት ወዲያውኑ ይረጩ። "
        "ትክክለኛ የሰብል ማዞሪያ ያድርጉ። ሁሉንም የተበከሉ እፅዋትን ያስወግዱ። "
        "Critical: This disease spreads fast in Ethiopian highlands during rainy season (ክረምት)."
    ),
    "Tomato_Bacterial_Spot": (
        "የቲማቲም ባክቴሪያ ነጠብጣብ: ከበሽታ የፀዳ የተረጋገጠ ዘር ይጠቀሙ። ከላይ ውሃ መስጠትን ያስወግዱ። "
        "የመዳብ ባክቴሪያ ገዳይ ይረጩ። የተበከሉ እፅዋትን ያስወግዱ። "
        "Ethiopian practice: Space plants well for air flow, especially in Rift Valley areas."
    ),
    "Tomato_Late_Blight": (
        "የቲማቲም ዘግይቶ ማቃጠያ: ሜታላክሲል ወይም ክሎሮታሎኒል ይረጩ። "
        "በማስገር እና በመደገፍ የአየር ዝውውርን ያሻሽሉ። የተበከሉ ቲሹዎችን ያስወግዱ። "
        "Local advice: Common in Bale, Arsi during belg rains - spray preventively."
    ),
    "Tomato_Septoria_Leaf_Spot": (
        "ሴፕቶሪያ ቅጠል ነጠብጣብ: የተበከሉ ቅጠሎችን ያስወግዱ እና ያጥፉ። ማንኮዜብ ወይም መዳብ ይረጩ። "
        "ውሃ ሲሰጡ ቅጠሎችን እርጥብ ማድረግን ያስወግዱ። በየዓመቱ ሰብሎችን ያዙሩ። "
        "Ethiopian method: Mulch with dry grass to prevent soil splash during rain."
    ),
    "Tomato_Early_Blight": (
        "የቲማቲም ቀደምት ማቃጠያ: የተበከሉ የታችኛ ቅጠሎችን ያስወግዱ። ክሎሮታሎኒል ወይም ማንኮዜብ ይረጩ። "
        "ጥሩ የአየር ዝውውር ያረጋግጡ። ከላይ ውሃ መስጠትን ያስወግዱ። "
        "Traditional: Plant basil (ቤሶብላ) nearby - natural companion plant."
    ),
    "Tomato_Leaf_Mold": (
        "የቲማቲም ቅጠል ሻጋታ: የግሪንሃውስ አየር ማናፈሻ ያሻሽሉ። መዳብ ወይም ማንኮዜብ ይረጩ። "
        "ከፍተኛ እርጥበትን ያስወግዱ። የተበከሉ ቅጠሎችን ወዲያውኑ ያስወግዱ። "
        "Ethiopian context: Common in plastic tunnels - ensure good ventilation during hot season."
    ),
}

# Default message for healthy plants
HEALTHY_ADVICE = "Your plant looks healthy! Continue regular watering and balanced nutrient management."
