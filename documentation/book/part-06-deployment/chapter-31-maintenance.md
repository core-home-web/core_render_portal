# Chapter 31: Maintenance

This chapter covers ongoing maintenance and update workflows.

---

## Update Workflow

### Code Updates

1. **Create feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make changes and test locally**
   ```bash
   pnpm dev
   pnpm test
   pnpm build
   ```

3. **Push and create PR**
   ```bash
   git push -u origin feature/new-feature
   gh pr create
   ```

4. **Review preview deployment**
   - Vercel creates preview URL automatically
   - Test all affected features

5. **Merge to main**
   - Triggers production deployment

---

## Database Updates

### Adding New Tables

1. Write migration SQL
2. Test on development Supabase
3. Run on production Supabase
4. Update types if needed

### Modifying Existing Tables

1. Use `ALTER TABLE` for non-breaking changes
2. For breaking changes, coordinate with code changes
3. Consider data migration for existing rows

---

## Dependency Updates

```bash
# Check for updates
pnpm outdated

# Update all dependencies
pnpm update

# Update specific package
pnpm update package-name
```

---

## Monitoring

### Vercel

- Monitor build times
- Check error rates in Functions tab
- Review usage analytics

### Supabase

- Monitor database size
- Check API request rates
- Review error logs

---

## Backups

### Database Backups

Supabase provides automatic daily backups. For manual backup:

```bash
# Via Supabase CLI
supabase db dump > backup.sql
```

### Code Backups

- GitHub stores all code history
- Regular pushes ensure nothing is lost

---

## Part 6 Complete

This concludes the deployment and production section. The Core Render Portal is now fully documented and ready for use.

---

*Return to [Table of Contents](../README.md)*
