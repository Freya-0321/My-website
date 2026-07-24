.PHONY: dev prod test migrate logs stop build clean

# 启动开发环境（前台输出日志，便于调试）
dev:
	docker compose up --build

# 启动生产环境（后台运行）
prod:
	docker compose up --build -d

# 运行后端测试
test:
	docker compose run --rm backend pytest tests/ -v

# 执行数据库迁移
migrate:
	docker compose run --rm backend alembic upgrade head

# 生成新的迁移文件： make migration name="add_xxx_column"
migration:
	docker compose run --rm backend alembic revision --autogenerate -m "$(name)"

# 查看所有服务日志
logs:
	docker compose logs -f

# 停止所有服务
stop:
	docker compose down

# 停止并清空数据卷（慎用，会清空数据库数据）
clean:
	docker compose down -v

# 仅重新构建镜像
build:
	docker compose build
