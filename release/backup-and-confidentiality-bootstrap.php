<?php
/* Reviewable one-time WPCode operation. Not loaded by the theme. */
if (!defined('ABSPATH') || !is_admin() || !current_user_can('manage_options')) { return; }
$wb_bootstrap_key = 'wb_release_private_backup_20261001_v1';
if (!add_option($wb_bootstrap_key, array('state'=>'running'), '', false)) { return; }
$wb_copied = 0;
$wb_cleaned = array();
$wb_private_permission = static function ($wb_path, $wb_mode) {
    if (!chmod($wb_path, $wb_mode)) { throw new RuntimeException("Private backup permissions could not be set."); }
    clearstatcache(true, $wb_path);
    $wb_permissions = fileperms($wb_path);
    if ($wb_permissions === false || ($wb_permissions & 0777) !== $wb_mode) {
        throw new RuntimeException("Private backup permissions could not be verified.");
    }
};
try {
    if (get_option('stylesheet') !== 'worksbetter-wpvibe-draft'
        || get_option('wpvibe_draft_source') !== 'worksbetter-wpvibe-draft'
        || get_option('wpvibe_draft_theme') !== 'worksbetter-wpvibe-draft-wpvibe-draft') {
        throw new RuntimeException('Theme state changed. Stop and reconcile the release.');
    }
    $wb_webroot = realpath(isset($_SERVER['DOCUMENT_ROOT']) ? $_SERVER['DOCUMENT_ROOT'] : '');
    $wb_theme_root = realpath(get_theme_root());
    if (!$wb_webroot || !$wb_theme_root || $wb_webroot === DIRECTORY_SEPARATOR) {
        throw new RuntimeException('Cannot establish the web root safely; no cleanup performed.');
    }
    $wb_parent = dirname($wb_webroot);
    if (!is_dir($wb_parent) || !is_writable($wb_parent)) {
        throw new RuntimeException('A private backup outside the web root needs hosting file access.');
    }
    $wb_backup = $wb_parent . '/worksbetter-release-private-20261001-' . wp_generate_password(12, false, false);
    if (strpos($wb_backup . '/', rtrim($wb_webroot, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR) === 0
        || file_exists($wb_backup) || !mkdir($wb_backup, 0700)) {
        throw new RuntimeException('Could not create a new private backup outside the web root.');
    }
    $wb_private_permission($wb_backup, 0700);
    $wb_themes = array('worksbetter', 'worksbetter-wpvibe-backup', 'worksbetter-wpvibe-draft', 'worksbetter-wpvibe-draft-wpvibe-draft');
    $wb_hashes = array();
    foreach ($wb_themes as $wb_slug) {
        $wb_source = $wb_theme_root . '/' . $wb_slug;
        if (!is_dir($wb_source) || is_link($wb_source)) {
            throw new RuntimeException('An expected theme is missing or symlinked; no cleanup performed.');
        }
        $wb_destination = $wb_backup . '/' . $wb_slug;
        if (!mkdir($wb_destination, 0700)) { throw new RuntimeException('Private backup folder creation failed.'); }
        $wb_private_permission($wb_destination, 0700);
        $wb_iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($wb_source, FilesystemIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );
        foreach ($wb_iterator as $wb_item) {
            if ($wb_item->isLink()) { throw new RuntimeException('A theme symlink needs manual backup review.'); }
            $wb_relative = substr($wb_item->getPathname(), strlen($wb_source) + 1);
            $wb_copy = $wb_destination . '/' . $wb_relative;
            if ($wb_item->isDir()) {
                if (!mkdir($wb_copy, 0700)) { throw new RuntimeException('Private backup directory copy failed.'); }
                $wb_private_permission($wb_copy, 0700);
            } elseif ($wb_item->isFile()) {
                if (!copy($wb_item->getPathname(), $wb_copy)) { throw new RuntimeException('Private backup file copy failed.'); }
                $wb_private_permission($wb_copy, 0600);
                $wb_hash = hash_file('sha256', $wb_item->getPathname());
                if (!$wb_hash || !hash_equals($wb_hash, (string) hash_file('sha256', $wb_copy))) {
                    throw new RuntimeException('Private backup checksum mismatch; no cleanup performed.');
                }
                $wb_hashes[$wb_slug . '/' . $wb_relative] = $wb_hash;
                $wb_copied++;
            }
        }
    }
    $wb_records = array();
    foreach (array(8,9,10,11,12,13,14,15,16,45,46,47,48,49,50,51,52,62) as $wb_id) {
        $wb_post = get_post($wb_id, ARRAY_A);
        if (!$wb_post) { throw new RuntimeException('An expected content record is missing; no cleanup performed.'); }
        $wb_records[$wb_id] = array('post'=>$wb_post, 'meta'=>get_post_meta($wb_id));
    }
    $wb_snapshot = wp_json_encode(array(
        'created_utc'=>gmdate('c'), 'scope'=>'Complete four affected theme directories and specified content/meta; not a full database backup',
        'site'=>home_url('/'), 'records'=>$wb_records, 'hashes'=>$wb_hashes,
        'theme_state'=>array('stylesheet'=>get_option('stylesheet'), 'template'=>get_option('template'),
            'draft_theme'=>get_option('wpvibe_draft_theme'), 'draft_source'=>get_option('wpvibe_draft_source'))
    ), JSON_PRETTY_PRINT);
    if (!$wb_snapshot || file_put_contents($wb_backup . '/content-and-state.json', $wb_snapshot, LOCK_EX) !== strlen($wb_snapshot)) {
        throw new RuntimeException('Content snapshot failed; no cleanup performed.');
    }
    $wb_private_permission($wb_backup . '/content-and-state.json', 0600);
    $wb_snapshot_sha256 = hash('sha256', $wb_snapshot);
    if (!hash_equals(hash('sha256', $wb_snapshot), (string) hash_file('sha256', $wb_backup . '/content-and-state.json'))) {
        throw new RuntimeException('Content snapshot checksum mismatch; no cleanup performed.');
    }
    // Only these known register exports are retired. Native pages are released separately.
    $wb_retire = array();
    foreach (array('worksbetter', 'worksbetter-wpvibe-backup', 'worksbetter-wpvibe-draft') as $wb_slug) {
        $wb_retire[$wb_slug . '/pages.json'] = "[]\n";
        $wb_retire[$wb_slug . '/assets/fleet-data.js'] = "/* Internal register retired. Original preserved in private release backup. */\n";
        $wb_retire[$wb_slug . '/assets/fleet.js'] = "/* Internal register interface retired. Reviewed safeguards replace it at release. */\n";
    }
    // All originals must still match the completed backup before the first replacement.
    foreach ($wb_retire as $wb_relative=>$wb_replacement) {
        if (!isset($wb_hashes[$wb_relative]) || !hash_equals($wb_hashes[$wb_relative], (string) hash_file('sha256', $wb_theme_root . '/' . $wb_relative))) {
            throw new RuntimeException('A register export changed during backup; no cleanup performed.');
        }
    }
    foreach ($wb_retire as $wb_relative=>$wb_replacement) {
        $wb_path = $wb_theme_root . '/' . $wb_relative;
        $wb_temp = $wb_path . '.wb-retire-tmp';
        if (file_exists($wb_temp) || is_link($wb_temp)) { throw new RuntimeException('A cleanup temporary file needs manual review.'); }
        $wb_handle = fopen($wb_temp, 'x');
        if (!$wb_handle) { throw new RuntimeException('Could not reserve a cleanup temporary file.'); }
        $wb_written = fwrite($wb_handle, $wb_replacement);
        fclose($wb_handle);
        if ($wb_written !== strlen($wb_replacement)) { unlink($wb_temp); throw new RuntimeException('Register retirement write failed.'); }
        if (!chmod($wb_temp, 0644)) { unlink($wb_temp); throw new RuntimeException('Retirement file permissions could not be set.'); }
        // Recheck the target immediately before swapping the prepared replacement into place.
        if (!hash_equals($wb_hashes[$wb_relative], (string) hash_file('sha256', $wb_path))) {
            unlink($wb_temp); throw new RuntimeException('A register export changed before replacement.');
        }
        if (!rename($wb_temp, $wb_path)) { unlink($wb_temp); throw new RuntimeException('Register retirement swap failed.'); }
        $wb_cleaned[] = $wb_relative;
    }
    update_option($wb_bootstrap_key, array('state'=>'complete', 'created_utc'=>gmdate('c'),
        'backup_dir'=>$wb_backup, 'copied_files'=>$wb_copied, 'retired_files'=>$wb_cleaned, 'snapshot_sha256'=>$wb_snapshot_sha256,
        'scope'=>'Affected themes/content only. Enquiry table, users, credentials and active-theme selection unchanged.'), false);
} catch (Throwable $wb_error) {
    // Preserve the private backup and report partial retirement; never silently restore confidential public exports.
    update_option($wb_bootstrap_key, array('state'=>'failed', 'message'=>$wb_error->getMessage(),
        'backup_dir'=>isset($wb_backup)?$wb_backup:null, 'copied_files'=>$wb_copied, 'retired_files'=>$wb_cleaned), false);
}
unset($wb_snapshot, $wb_records, $wb_hashes);
