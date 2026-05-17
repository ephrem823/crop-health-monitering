from huggingface_hub import hf_hub_download

hf_hub_download(
    repo_id="efaxale/crop-health-model",
    filename="crop_health_model_fixed.h5",
    local_dir="/app/models"
)
