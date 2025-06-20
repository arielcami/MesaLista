package pe.com.mesalista.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String basePath = System.getProperty("user.dir");
        String location = "file:" + basePath + "/source-img/productos/";

        registry.addResourceHandler("/img/productos/**")
                .addResourceLocations(location)
                .setCachePeriod(0);
    }
}
