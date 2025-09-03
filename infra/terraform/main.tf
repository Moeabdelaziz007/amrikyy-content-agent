terraform {
  required_version = ">= 1.6.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.35"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "us-central1"
}

resource "google_project_service" "services" {
  for_each = toset([
    "firestore.googleapis.com",
    "cloudfunctions.googleapis.com",
    "run.googleapis.com",
    "iam.googleapis.com",
    "secretmanager.googleapis.com"
  ])
  project = var.project_id
  service = each.value
}

resource "google_firestore_database" "default" {
  project     = var.project_id
  name        = "(default)"
  location_id = "us-central"
  type        = "FIRESTORE_NATIVE"
  depends_on  = [google_project_service.services]
}

resource "google_service_account" "functions_sa" {
  account_id   = "content-agent-fn"
  display_name = "Content Agent Functions SA"
}

resource "google_project_iam_member" "functions_sa_roles" {
  for_each = toset([
    "roles/datastore.user",
    "roles/logging.logWriter",
    "roles/secretmanager.secretAccessor"
  ])
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.functions_sa.email}"
}
