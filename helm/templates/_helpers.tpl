{{/*
Expand the name of the chart.
*/}}
{{- define "core-database-service.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "core-database-service.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "core-database-service.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "core-database-service.labels" -}}
helm.sh/chart: {{ include "core-database-service.chart" . }}
{{ include "core-database-service.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "core-database-service.selectorLabels" -}}
app.kubernetes.io/name: {{ include "core-database-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "core-database-service.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "core-database-service.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Database URL from secret
*/}}
{{- define "core-database-service.databaseUrl" -}}
{{- if .Values.database.existingSecret }}
{{- printf "postgresql://$(DATABASE_USER):$(DATABASE_PASSWORD)@%s:%d/%s" .Values.database.host (.Values.database.port | int) .Values.database.name }}
{{- else }}
{{- .Values.database.url }}
{{- end }}
{{- end }}

{{/*
Redis URL
*/}}
{{- define "core-database-service.redisUrl" -}}
{{- if .Values.redis.password }}
{{- printf "redis://:%s@%s:%d/%d" .Values.redis.password .Values.redis.host (.Values.redis.port | int) (.Values.redis.database | int) }}
{{- else }}
{{- printf "redis://%s:%d/%d" .Values.redis.host (.Values.redis.port | int) (.Values.redis.database | int) }}
{{- end }}
{{- end }}

{{/*
Istio labels for service mesh
*/}}
{{- define "core-database-service.istioLabels" -}}
{{- if .Values.istio.enabled }}
version: {{ .Chart.AppVersion | quote }}
{{- end }}
{{- end }}
