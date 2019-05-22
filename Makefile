PRETTIER_TARGET = "src/**/*.{ts,tsx}"
up:
	docker-compose up
down:
	docker-compose down

fmt:
	PRETTIER_TARGET=${PRETTIER_TARGET} npm run fmt