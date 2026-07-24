"""Celery 应用实例与定时任务（Beat）配置。"""
from celery import Celery
from celery.schedules import crontab

from app.config import settings

celery_app = Celery(
    "ai_visibility",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.evaluation_tasks", "app.tasks.monitor_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Shanghai",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=60 * 15,
)

# 定时任务：每 MONITOR_INTERVAL_MINUTES 分钟对所有已启用监控的品牌跑一轮检测
celery_app.conf.beat_schedule = {
    "run-scheduled-monitor": {
        "task": "app.tasks.monitor_tasks.run_scheduled_monitor",
        "schedule": crontab(minute=f"*/{settings.MONITOR_INTERVAL_MINUTES}"),
    },
}
