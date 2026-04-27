.PHONY: generate-default

gen-resource:
	@ echo "Generating resource entities for Nest"
	@ nest g resource $(NAME)
