<?php defined('ABSPATH') || exit; ?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width,initial-scale=1"><?php wp_head(); ?></head>
<?php $wb_attrs = get_post_meta(get_queried_object_id(), '_wb_attrs', true); if (!is_array($wb_attrs)) $wb_attrs=array(); ?>
<body <?php body_class($wb_attrs['class'] ?? ''); ?><?php foreach($wb_attrs as $key=>$value) { if(strpos($key,'data-')===0) echo ' '.esc_attr($key).'="'.esc_attr($value).'"'; } ?>>
<?php wp_body_open(); ?>
<?php if(have_posts()): while(have_posts()): the_post(); ?>
<?php if(!get_post_meta(get_the_ID(),'_wb_imported',true)): ?><main class="wrap"><h1><?php the_title(); ?></h1><?php endif; ?>
<?php the_content(); ?>
<?php if(!get_post_meta(get_the_ID(),'_wb_imported',true)): ?></main><?php endif; ?>
<?php endwhile; else: ?><main class="wrap"><h1>Page not found</h1><a href="<?php echo esc_url(home_url('/')); ?>">Return to Works Better</a></main><?php endif; ?>
<?php wp_footer(); ?>
</body></html>

